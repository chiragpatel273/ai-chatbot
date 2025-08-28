import express from 'express';
import cors from 'cors';
import { json } from 'express';
import { notFoundHandler } from '@middleware/notFound';
import { errorHandler } from '@middleware/errorHandler';
import { requestLogger } from '@middleware/requestLogger';
import { registerRoutes } from '@routes/index';

export const app = express();
app.use(cors());
app.use(json({ limit: '1mb' }));
app.use(requestLogger);
registerRoutes(app);
app.use(notFoundHandler);
app.use(errorHandler);
