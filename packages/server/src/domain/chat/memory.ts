import { ChatMessage } from './chat.types';
import { randomUUID } from 'crypto';
import { logger } from '@utils/logger';

export interface ConversationEntry extends ChatMessage {
  timestamp: number;
}

export interface ConversationRecord {
  id: string;
  messages: ConversationEntry[];
  createdAt: number;
  updatedAt: number;
}

// Simple in-memory conversation store. For production, replace with Redis/DB.
const conversations = new Map<string, ConversationRecord>();

// Configuration
const MAX_MESSAGES_PER_CONVERSATION = 50; // Prevent unbounded growth
const CONVERSATION_EXPIRY_MS = 1000 * 60 * 60 * 24; // 24 hours

export function createConversation(initialMessages: ChatMessage[] = []): ConversationRecord {
  const id = randomUUID();
  const now = Date.now();
  const record: ConversationRecord = {
    id,
    messages: initialMessages.map((m) => ({ ...m, timestamp: now })),
    createdAt: now,
    updatedAt: now,
  };
  conversations.set(id, record);
  logger.debug(
    { conversationId: id, messageCount: initialMessages.length },
    'Created new conversation',
  );
  return record;
}

export function getConversation(id: string): ConversationRecord | undefined {
  const record = conversations.get(id);
  if (!record) {
    logger.debug({ conversationId: id }, 'Conversation not found');
    return undefined;
  }

  // Check if expired
  if (Date.now() - record.updatedAt > CONVERSATION_EXPIRY_MS) {
    logger.debug({ conversationId: id }, 'Conversation expired, removing');
    conversations.delete(id);
    return undefined;
  }

  return record;
}

export function appendMessage(
  conversationId: string,
  message: ChatMessage,
): ConversationRecord | undefined {
  const record = getConversation(conversationId);
  if (!record) return undefined;

  const entry: ConversationEntry = { ...message, timestamp: Date.now() };
  record.messages.push(entry);
  record.updatedAt = Date.now();

  // Trim old messages if exceeding limit (keep most recent)
  if (record.messages.length > MAX_MESSAGES_PER_CONVERSATION) {
    const removed = record.messages.length - MAX_MESSAGES_PER_CONVERSATION;
    record.messages.splice(0, removed);
    logger.debug({ conversationId, removedMessages: removed }, 'Trimmed old messages');
  }

  logger.debug(
    { conversationId, role: message.role, messageCount: record.messages.length },
    'Appended message to conversation',
  );
  return record;
}

export function getConversationMessages(conversationId: string): ChatMessage[] {
  const record = getConversation(conversationId);
  return record ? record.messages.map(({ role, content }) => ({ role, content })) : [];
}

export function upsertConversation(
  conversationId?: string,
  userMessage?: ChatMessage,
): {
  id: string;
  history: ChatMessage[];
} {
  if (!conversationId) {
    // Create new conversation
    const record = createConversation();
    if (userMessage) {
      appendMessage(record.id, userMessage);
    }
    return {
      id: record.id,
      history: getConversationMessages(record.id),
    };
  }

  // Get or create existing conversation
  let record = getConversation(conversationId);
  if (!record) {
    logger.debug({ conversationId }, 'Creating new conversation with provided ID');
    record = createConversation();
    // Note: we use the generated UUID, not the provided one for security
  }

  if (userMessage) {
    appendMessage(record.id, userMessage);
  }

  return {
    id: record.id,
    history: getConversationMessages(record.id),
  };
}

// Cleanup expired conversations periodically
export function pruneExpiredConversations(): number {
  const now = Date.now();
  let pruned = 0;

  for (const [id, record] of conversations.entries()) {
    if (now - record.updatedAt > CONVERSATION_EXPIRY_MS) {
      conversations.delete(id);
      pruned++;
    }
  }

  if (pruned > 0) {
    logger.info({ prunedCount: pruned }, 'Pruned expired conversations');
  }

  return pruned;
}

// Auto-cleanup every 30 minutes
setInterval(pruneExpiredConversations, 1000 * 60 * 30).unref();

export function getConversationStats() {
  return {
    totalConversations: conversations.size,
    memoryUsageEstimate: `${Math.round(JSON.stringify([...conversations.values()]).length / 1024)}KB`,
  };
}
