import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const elapsed = Date.now() - start;
    const { method, originalUrl, headers } = req;
    const { statusCode } = res;
    const contentLength = res.get('content-length');
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || '';

    const logObject = {
      method,
      url: originalUrl,
      status: statusCode,
      headers,
      contentLength,
      ip,
      userAgent,
      responseTime: `${elapsed}ms`,
    };

    console.log(logObject);
  });

  next();
}
