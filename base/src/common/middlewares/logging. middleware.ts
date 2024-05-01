// logging.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`Received Request: ${req.method} ${req.url}`);
    console.log(`Request Headers: ${JSON.stringify(req.headers)}`);
    console.log(`Request Body: ${JSON.stringify(req.body)}`);
    console.log(`Request Query String: ${JSON.stringify(req.query)}`)
    next();
  }
}
