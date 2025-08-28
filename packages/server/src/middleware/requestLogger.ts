import { Request, Response, NextFunction } from 'express';
import { logger } from '@utils/logger';
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    logger.info({ method: req.method, url: req.originalUrl, status: res.statusCode, ms }, 'req');
  });
  next();
}
