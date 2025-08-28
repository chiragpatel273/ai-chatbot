import { Request, Response } from 'express';
import { z } from 'zod';
import { createChatCompletion, streamChatCompletion } from './chat.service';
import { logger } from '@utils/logger';

const messageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().min(1),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1),
  stream: z.boolean().optional().default(false),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().min(1).max(4096).optional(),
});

export async function handleChat(req: Request, res: Response) {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
  }
  const { messages, stream, temperature, max_tokens } = parsed.data;
  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    try {
      for await (const chunk of streamChatCompletion({ messages, temperature, max_tokens })) {
        res.write(chunk);
      }
      res.end();
    } catch (err: any) {
      logger.error({ err }, 'Streaming chat error');
      if (!res.headersSent) res.status(500);
      res.end();
    }
    return;
  }
  try {
    const completion = await createChatCompletion({ messages, temperature, max_tokens });
    const content = completion.choices[0]?.message?.content || '';
    res.json({ content, raw: completion });
  } catch (err: any) {
    logger.error({ err }, 'Chat completion error');
    res.status(500).json({ error: 'Chat completion failed' });
  }
}
