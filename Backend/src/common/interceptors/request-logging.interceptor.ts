import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

// Logs every request with method, path, status, latency, IP and authenticated
// user id (if any). Errors with status >= 500 are logged at error level so
// they show up in alerting; auth-related routes are tagged so they can be
// fanned out to a SIEM by route prefix.
@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Http');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpCtx = context.switchToHttp();
    const req = httpCtx.getRequest<Request & { user?: { id?: string } }>();
    const res = httpCtx.getResponse<Response>();
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => this.write(req, res, Date.now() - start),
        error: (err: { status?: number; message?: string }) => {
          const status = err?.status ?? res.statusCode ?? 500;
          this.write(req, res, Date.now() - start, status, err?.message);
        },
      }),
    );
  }

  private write(
    req: Request & { user?: { id?: string } },
    res: Response,
    ms: number,
    overrideStatus?: number,
    errMessage?: string,
  ) {
    const status = overrideStatus ?? res.statusCode;
    const isAuthPath = req.originalUrl?.startsWith('/api/auth');
    const userId = req.user?.id ?? '-';
    const line = `${req.method} ${req.originalUrl} ${status} ${ms}ms ip=${req.ip} user=${userId}${
      isAuthPath ? ' [auth]' : ''
    }${errMessage ? ` err="${errMessage}"` : ''}`;

    if (status >= 500) this.logger.error(line);
    else if (status >= 400) this.logger.warn(line);
    else this.logger.log(line);
  }
}
