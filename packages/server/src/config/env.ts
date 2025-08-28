import { z } from 'zod';
import dotenv from 'dotenv';
let parsed: z.infer<typeof schema> | null = null;

const schema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.string().optional(),
  GROQ_API_KEY: z.string().min(10, 'GROQ_API_KEY is required'),
});

export function loadEnv() {
  if (!parsed) {
    dotenv.config();
    const result = schema.safeParse(process.env);
    if (!result.success) {
      console.error('Env validation failed:', result.error.flatten().fieldErrors);
      throw new Error('Invalid environment variables');
    }
    parsed = result.data;
  }
  return parsed;
}

export function env() {
  if (!parsed) loadEnv();
  return parsed!;
}
