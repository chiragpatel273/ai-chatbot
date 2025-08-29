import { Request, Response } from 'express';
import { z } from 'zod';
import { createChatCompletion, streamChatCompletion } from './chat.service';
import { logger } from '@utils/logger';
import { upsertConversation, appendMessage } from './memory';

const messageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().min(1),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1),
  conversationId: z.string().uuid().optional(),
  stream: z.boolean().optional().default(false),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().min(1).max(4096).optional(),
});

export async function handleChat(req: Request, res: Response) {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
  }
  const { messages, conversationId, stream, temperature, max_tokens } = parsed.data;

  // Extract user message (assume last message is from user)
  const userMessage = messages[messages.length - 1];
  const isUserMessage = userMessage?.role === 'user';

  // Manage conversation context
  const { id: currentConversationId, history } = upsertConversation(
    conversationId,
    isUserMessage ? userMessage : undefined,
  );

  // Build context: use full history + any new system messages from request
  const systemMessages = messages.filter((m) => m.role === 'system');
  const contextMessages = [...systemMessages, ...history];

  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    let assistantResponse = '';

    try {
      for await (const chunk of streamChatCompletion({
        messages: contextMessages,
        temperature,
        max_tokens,
      })) {
        assistantResponse += chunk;
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }

      // Store assistant response in conversation
      if (assistantResponse.trim()) {
        appendMessage(currentConversationId, { role: 'assistant', content: assistantResponse });
      }

      res.write(
        `data: ${JSON.stringify({ type: 'done', conversationId: currentConversationId })}\n\n`,
      );
      res.end();
    } catch (err: any) {
      logger.error({ err, conversationId: currentConversationId }, 'Streaming chat error');
      if (!res.headersSent) res.status(500);
      res.write(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
      res.end();
    }
    return;
  }

  try {
    const completion = await createChatCompletion({
      messages: contextMessages,
      temperature,
      max_tokens,
    });
    const content = completion.choices[0]?.message?.content || '';

    // Store assistant response in conversation
    if (content.trim()) {
      appendMessage(currentConversationId, { role: 'assistant', content });
    }

    res.json({
      content,
      conversationId: currentConversationId,
      raw: completion,
    });
  } catch (err: any) {
    logger.error({ err, conversationId: currentConversationId }, 'Chat completion error');
    res.status(500).json({ error: 'Chat completion failed' });
  }
}
