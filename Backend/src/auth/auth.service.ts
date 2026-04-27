import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AuthEvent, Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailerService } from './mailer.service';

const BCRYPT_ROUNDS = 12;
const MAX_LOGIN_FAILURES = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

// Bcrypt hash of a random string used as a constant-time decoy when a user
// does not exist, so login latency is the same regardless.
const DECOY_HASH = bcrypt.hashSync(crypto.randomBytes(32).toString('hex'), BCRYPT_ROUNDS);

export interface AuthContext {
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly requireEmailVerification: boolean;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailer: MailerService,
  ) {
    this.requireEmailVerification =
      this.configService.get<string>('REQUIRE_EMAIL_VERIFICATION') !== 'false';
  }

  // ── Registration ────────────────────────────────────────
  async register(dto: RegisterDto, ctx: AuthContext) {
    const email = dto.email.toLowerCase().trim();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Generic message — do not leak which emails are registered.
      throw new ConflictException('Unable to register with the provided details');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const { token, hash, expires } = this.makeToken(VERIFY_TOKEN_TTL_MS);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: dto.name,
        phone: dto.phone,
        emailVerifyTokenHash: hash,
        emailVerifyTokenExpires: expires,
      },
    });

    await this.audit(AuthEvent.REGISTER, ctx, { userId: user.id, email });
    await this.mailer.sendVerificationEmail(email, token);

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
      user: this.publicUser(user),
    };
  }

  // ── Login ───────────────────────────────────────────────
  async login(dto: LoginDto, ctx: AuthContext) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user?.lockedUntil && user.lockedUntil > new Date()) {
      await this.audit(AuthEvent.LOGIN_LOCKED, ctx, {
        userId: user.id,
        email,
        reason: 'account locked',
      });
      throw new UnauthorizedException(
        'Account temporarily locked due to too many failed attempts. Try again later.',
      );
    }

    // Always run bcrypt to keep constant timing whether or not the user exists.
    const ok = await bcrypt.compare(
      dto.password,
      user?.password ?? DECOY_HASH,
    );

    if (!user || !ok) {
      if (user) {
        await this.recordFailure(user.id);
      }
      await this.audit(AuthEvent.LOGIN_FAILURE, ctx, {
        userId: user?.id ?? null,
        email,
        reason: !user ? 'unknown email' : 'bad password',
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (this.requireEmailVerification && !user.emailVerified) {
      await this.audit(AuthEvent.LOGIN_FAILURE, ctx, {
        userId: user.id,
        email,
        reason: 'email not verified',
      });
      throw new ForbiddenException('Please verify your email before logging in.');
    }

    const refreshed = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        loginFailures: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ctx.ip ?? null,
      },
      select: { tokenVersion: true },
    });

    await this.audit(AuthEvent.LOGIN_SUCCESS, ctx, { userId: user.id, email });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      ver: refreshed.tokenVersion,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: this.publicUser(user),
    };
  }

  // ── Session revocation ─────────────────────────────────
  // Bumps the user's tokenVersion. JwtStrategy then refuses any pre-existing
  // JWT for this user. Used for logout, password reset, and role change.
  async revokeSessions(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });
  }

  // ── Email verification ──────────────────────────────────
  async verifyEmail(token: string, ctx: AuthContext) {
    const hash = this.hashToken(token);
    const user = await this.prisma.user.findUnique({
      where: { emailVerifyTokenHash: hash },
    });

    if (
      !user ||
      !user.emailVerifyTokenExpires ||
      user.emailVerifyTokenExpires < new Date()
    ) {
      throw new BadRequestException('Verification link is invalid or has expired.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyTokenHash: null,
        emailVerifyTokenExpires: null,
      },
    });

    await this.audit(AuthEvent.EMAIL_VERIFY, ctx, {
      userId: user.id,
      email: user.email,
    });
    return { message: 'Email verified. You may now log in.' };
  }

  async resendVerification(email: string, ctx: AuthContext) {
    const normalized = email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email: normalized } });

    // Same response whether or not the email exists, to avoid enumeration.
    if (user && !user.emailVerified) {
      const { token, hash, expires } = this.makeToken(VERIFY_TOKEN_TTL_MS);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerifyTokenHash: hash, emailVerifyTokenExpires: expires },
      });
      await this.mailer.sendVerificationEmail(normalized, token);
    }
    await this.audit(AuthEvent.PASSWORD_RESET_REQUEST, ctx, {
      userId: user?.id ?? null,
      email: normalized,
      reason: 'resend verification',
    });
    return { message: 'If that account exists, a verification email has been sent.' };
  }

  // ── Password reset ──────────────────────────────────────
  async forgotPassword(email: string, ctx: AuthContext) {
    const normalized = email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email: normalized } });

    if (user) {
      const { token, hash, expires } = this.makeToken(RESET_TOKEN_TTL_MS);
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetTokenHash: hash,
          passwordResetTokenExpires: expires,
        },
      });
      await this.mailer.sendPasswordResetEmail(normalized, token);
    }

    await this.audit(AuthEvent.PASSWORD_RESET_REQUEST, ctx, {
      userId: user?.id ?? null,
      email: normalized,
    });
    return {
      message:
        'If an account exists for that email, a password reset link has been sent.',
    };
  }

  async resetPassword(token: string, newPassword: string, ctx: AuthContext) {
    const hash = this.hashToken(token);
    const user = await this.prisma.user.findUnique({
      where: { passwordResetTokenHash: hash },
    });

    if (
      !user ||
      !user.passwordResetTokenExpires ||
      user.passwordResetTokenExpires < new Date()
    ) {
      throw new BadRequestException('Reset link is invalid or has expired.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetTokenHash: null,
        passwordResetTokenExpires: null,
        loginFailures: 0,
        lockedUntil: null,
        // Revoke every existing JWT for this user. Whoever held the old
        // password (legitimate user or attacker) is signed out everywhere.
        tokenVersion: { increment: 1 },
      },
    });

    await this.audit(AuthEvent.PASSWORD_RESET_COMPLETE, ctx, {
      userId: user.id,
      email: user.email,
    });
    return { message: 'Password updated. Please log in with your new password.' };
  }

  // ── Helpers ─────────────────────────────────────────────
  private async recordFailure(userId: string) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { loginFailures: { increment: 1 } },
      select: { loginFailures: true },
    });
    if (updated.loginFailures >= MAX_LOGIN_FAILURES) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          lockedUntil: new Date(Date.now() + LOCKOUT_MS),
          loginFailures: 0,
        },
      });
    }
  }

  private makeToken(ttlMs: number) {
    const token = crypto.randomBytes(32).toString('hex');
    const hash = this.hashToken(token);
    const expires = new Date(Date.now() + ttlMs);
    return { token, hash, expires };
  }

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private publicUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    };
  }

  private async audit(
    event: AuthEvent,
    ctx: AuthContext,
    extra: { userId?: string | null; email?: string | null; reason?: string } = {},
  ) {
    try {
      const data: Prisma.AuthLogUncheckedCreateInput = {
        event,
        userId: extra.userId ?? null,
        email: extra.email ?? null,
        reason: extra.reason ?? null,
        ip: ctx.ip ?? null,
        userAgent: ctx.userAgent?.slice(0, 500) ?? null,
      };
      await this.prisma.authLog.create({ data });
    } catch (err) {
      // Audit log failures must not break auth flow.
      this.logger.error('Failed to write auth log', err as Error);
    }
  }
}
