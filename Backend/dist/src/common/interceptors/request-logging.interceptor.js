"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestLoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
let RequestLoggingInterceptor = class RequestLoggingInterceptor {
    logger = new common_1.Logger('Http');
    intercept(context, next) {
        const httpCtx = context.switchToHttp();
        const req = httpCtx.getRequest();
        const res = httpCtx.getResponse();
        const start = Date.now();
        return next.handle().pipe((0, rxjs_1.tap)({
            next: () => this.write(req, res, Date.now() - start),
            error: (err) => {
                const status = err?.status ?? res.statusCode ?? 500;
                this.write(req, res, Date.now() - start, status, err?.message);
            },
        }));
    }
    write(req, res, ms, overrideStatus, errMessage) {
        const status = overrideStatus ?? res.statusCode;
        const isAuthPath = req.originalUrl?.startsWith('/api/auth');
        const userId = req.user?.id ?? '-';
        const line = `${req.method} ${req.originalUrl} ${status} ${ms}ms ip=${req.ip} user=${userId}${isAuthPath ? ' [auth]' : ''}${errMessage ? ` err="${errMessage}"` : ''}`;
        if (status >= 500)
            this.logger.error(line);
        else if (status >= 400)
            this.logger.warn(line);
        else
            this.logger.log(line);
    }
};
exports.RequestLoggingInterceptor = RequestLoggingInterceptor;
exports.RequestLoggingInterceptor = RequestLoggingInterceptor = __decorate([
    (0, common_1.Injectable)()
], RequestLoggingInterceptor);
//# sourceMappingURL=request-logging.interceptor.js.map