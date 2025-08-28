import { loadEnv } from '@config/env';
loadEnv();
import { app } from './app';
import { logger } from '@utils/logger';

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  logger.info({ port: PORT }, `Server listening on http://localhost:${PORT}`);
});

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught exception');
  process.exit(1);
});
