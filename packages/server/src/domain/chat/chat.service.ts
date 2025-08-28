import { env } from '@config/env';
import { ChatMessage } from './chat.types';
import { logger } from '@utils/logger';
const CHAT_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
interface StandardResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{ message: { role: string; content: string }; finish_reason: string | null }>;
}

export async function createChatCompletion(params: {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}): Promise<StandardResponse> {
  const response = await fetch(CHAT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env().GROQ_API_KEY}` },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.max_tokens ?? 512,
      stream: false,
    }),
  });
  if (!response.ok) {
    const text = await response.text();
    logger.error({ status: response.status, text }, 'Groq API error');
    throw new Error(`Groq API error: ${response.status}`);
  }
  return (await response.json()) as StandardResponse;
}

export async function* streamChatCompletion(params: {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}): AsyncGenerator<string, void, unknown> {
  const response = await fetch(CHAT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env().GROQ_API_KEY}` },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.max_tokens ?? 512,
      stream: true,
    }),
  });
  if (!response.ok || !response.body) {
    const text = await response.text().catch(() => '');
    throw new Error(`Groq streaming error ${response.status}: ${text}`);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data:')) continue;
      const data = trimmed.substring(5).trim();
      if (data === '[DONE]') {
        return;
      }
      try {
        const json = JSON.parse(data) as any;
        const delta: string | undefined = json.choices?.[0]?.delta?.content;
        if (delta) {
          yield delta;
        }
      } catch (err) {
        logger.warn({ err, data }, 'Failed to parse streaming chunk');
      }
    }
  }
}
