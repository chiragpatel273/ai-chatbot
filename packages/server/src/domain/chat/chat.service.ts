import { env } from '@config/env';
import { ChatMessage } from './chat.types';
import { logger } from '@utils/logger';
import Groq from 'groq-sdk';

// Singleton Groq client
const groq = new Groq({ apiKey: env().GROQ_API_KEY });

// Mirror the shape we previously returned for compatibility
export interface StandardResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{ message: { role: string; content: string }; finish_reason: string | null }>;
}

const DEFAULT_MODEL = 'llama3-70b-8192';

export async function createChatCompletion(params: {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}): Promise<StandardResponse> {
  try {
    const completion = await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.max_tokens ?? 512,
      stream: false,
    });
    return completion as unknown as StandardResponse;
  } catch (err: any) {
    logger.error({ err }, 'Groq SDK chat completion failed');
    throw err;
  }
}

export async function* streamChatCompletion(params: {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}): AsyncGenerator<string, void, unknown> {
  let stream: AsyncIterable<any> | undefined;
  try {
    stream = (await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.max_tokens ?? 512,
      stream: true,
    })) as unknown as AsyncIterable<any>;
  } catch (err: any) {
    logger.error({ err }, 'Groq SDK stream creation failed');
    throw err;
  }
  for await (const chunk of stream) {
    const delta: string | undefined = (chunk as any)?.choices?.[0]?.delta?.content;
    if (delta) yield delta;
  }
}
