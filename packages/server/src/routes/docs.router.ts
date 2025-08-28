import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from '@routes/openapi';

export const docsRouter = Router();
docsRouter.use('/', swaggerUi.serve, swaggerUi.setup(openApiSpec));
