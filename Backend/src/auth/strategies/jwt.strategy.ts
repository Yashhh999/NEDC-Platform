import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

const MIN_SECRET_LENGTH = 32;

function cookieOrHeaderExtractor(req: Request): string | null {
  if (req?.cookies?.access_token) {
    return req.cookies.access_token;
  }
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  ver: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService, private prisma: PrismaService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    if (secret.length < MIN_SECRET_LENGTH) {
      throw new Error(
        `JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters`,
      );
    }
    if (
      process.env.NODE_ENV === 'production' &&
      /dev|local|change[-_ ]?me|example|secret/i.test(secret)
    ) {
      throw new Error(
        'JWT_SECRET appears to be a placeholder; rotate it before running in production',
      );
    }

    super({
      jwtFromRequest: cookieOrHeaderExtractor,
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  // Always validate against the live DB row so:
  //  - Role demotion takes effect on the next request, not at JWT expiry.
  //  - Logout / password reset / explicit revocation invalidate the token
  //    via tokenVersion mismatch.
  // The cost is one indexed lookup per authenticated request — acceptable
  // given the alternative is privilege persistence.
  async validate(payload: JwtPayload) {
    if (!payload?.sub || typeof payload.ver !== 'number') {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, tokenVersion: true },
    });

    if (!user) {
      throw new UnauthorizedException('Account no longer exists');
    }
    if (user.tokenVersion !== payload.ver) {
      throw new UnauthorizedException('Session has been revoked');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
