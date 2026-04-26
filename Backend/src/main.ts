import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'], // production-ready logging levels
  });

  // ── Security: HTTP headers ──
  app.use(helmet.default());

  // ── Security: CORS — restrict to known origins ──
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
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
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  // ── Global exception filter — consistent error responses ──
  app.useGlobalFilters(new HttpExceptionFilter());

  // ── Global response interceptor ──
  app.useGlobalInterceptors(new ResponseInterceptor());

  // ── Global prefix ──
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 NEDC Backend running on http://localhost:${port}`);
  console.log(`📚 API Base: http://localhost:${port}/api`);
}
bootstrap();
