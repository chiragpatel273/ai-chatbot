import { chatRouter } from '@domain/chat/chat.router';
import { Express, Router } from 'express';
import { docsRouter } from './docs.router';
import { healthRouter } from './health.router';

export function registerRoutes(app: Express) {
  const apiV1 = Router();
  apiV1.use('/chat', chatRouter);
  apiV1.use('/health', healthRouter); // /api/v1/health
  apiV1.use('/docs', docsRouter); // swagger UI at /api/v1/docs
  app.use('/api/v1', apiV1);
  app.use('/health', healthRouter); // fallback simple health
}
