"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const request_logging_interceptor_1 = require("./common/interceptors/request-logging.interceptor");
const MIN_JWT_SECRET_LENGTH = 32;
function assertSecrets(logger) {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < MIN_JWT_SECRET_LENGTH) {
        throw new Error(`JWT_SECRET must be set and at least ${MIN_JWT_SECRET_LENGTH} characters`);
    }
    if (process.env.NODE_ENV === 'production' &&
        /dev|local|change[-_ ]?me|example|secret/i.test(secret)) {
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
    const logger = new common_1.Logger('Bootstrap');
    assertSecrets(logger);
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log'],
    });
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
        hsts: process.env.NODE_ENV === 'production'
            ? { maxAge: 63072000, includeSubDomains: true, preload: true }
            : false,
    }));
    app.set('trust proxy', 1);
    app.use('/api/payments/webhook', express_1.default.raw({ type: '*/*', limit: '1mb' }), (req, _res, next) => {
        if (Buffer.isBuffer(req.body)) {
            req.rawBody = req.body;
            req.body = {};
        }
        next();
    });
    app.use(express_1.default.json({ limit: '256kb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '256kb' }));
    app.use((0, cookie_parser_1.default)());
    const allowedOrigins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
        : ['http://localhost:3000'];
    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: false },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new request_logging_interceptor_1.RequestLoggingInterceptor(), new response_interceptor_1.ResponseInterceptor());
    app.setGlobalPrefix('api');
    const port = process.env.PORT || 3001;
    await app.listen(port);
    logger.log(`NEDC Backend running on port ${port}`);
    logger.log(`API base path: /api`);
}
bootstrap().catch((err) => {
    console.error('Fatal startup error:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map