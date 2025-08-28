import pino from 'pino';

function buildTransport() {
  if (process.env.NODE_ENV === 'production') return undefined;
  try {
    // Dynamically require so build doesn't fail if omitted in prod
    return {
      target: 'pino-pretty',
      options: { translateTime: 'SYS:standard', colorize: true },
    } as const;
  } catch {
    return undefined; // fallback to JSON logs
  }
}

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: buildTransport(),
});
