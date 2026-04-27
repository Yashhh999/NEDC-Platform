import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import express, { Request } from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';

const MIN_JWT_SECRET_LENGTH = 32;

function assertSecrets(logger: Logger) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be set and at least ${MIN_JWT_SECRET_LENGTH} characters`,
    );
  }
  if (
    process.env.NODE_ENV === 'production' &&
    /dev|local|change[-_ ]?me|example|secret/i.test(secret)
  ) {
    throw new Error('JWT_SECRET appears to be a placeholder; rotate before production');
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set');
  }

  for (const key of [
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'RAZORPAY_WEBHOOK_SECRET',
  ]) {
    if (!process.env[key]) {
      logger.warn(`${key} is not set — payment endpoints will refuse requests`);
    }
  }
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  assertSecrets(logger);

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // ── Security: HTTP headers (CSP, HSTS, X-Frame, etc.) ──
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
      hsts: process.env.NODE_ENV === 'production'
        ? { maxAge: 63072000, includeSubDomains: true, preload: true }
        : false,
    }),
  );

  // ── Trust proxy headers (X-Forwarded-For/Proto) when running behind a
  //    reverse proxy or load balancer. Required for `req.ip` (used by
  //    rate limiting and audit logs) and the `secure` cookie flag to work.
  app.set('trust proxy', 1);

  // ── Capture raw body only for the Razorpay webhook so HMAC verification
  //    sees exactly the bytes Razorpay signed. JSON parsing for that route
  //    is performed inside the service after signature verification.
  app.use(
    '/api/payments/webhook',
    express.raw({ type: '*/*', limit: '1mb' }),
    (req: Request & { rawBody?: Buffer }, _res, next) => {
      if (Buffer.isBuffer(req.body)) {
        req.rawBody = req.body;
        // Replace body with an empty object — controller reads rawBody.
        req.body = {} as unknown as Request['body'];
      }
      next();
    },
  );

  // ── Standard JSON body parser for all other routes. Capped at a sane size.
  app.use(express.json({ limit: '256kb' }));
  app.use(express.urlencoded({ extended: true, limit: '256kb' }));

  app.use(cookieParser());

  // ── CORS: restrict to the allowlist. Credentials enabled because the
  //    session cookie is httpOnly + sameSite=strict.
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
    : ['http://localhost:3000'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature'],
  });

  // ── Validation: strip unknown fields, reject malformed data ──
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new RequestLoggingInterceptor(),
    new ResponseInterceptor(),
  );

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`NEDC Backend running on port ${port}`);
  logger.log(`API base path: /api`);
}

bootstrap().catch((err) => {
  // Fail loudly — startup misconfiguration must not silently degrade.
  // eslint-disable-next-line no-console
  console.error('Fatal startup error:', err);
  process.exit(1);
});
