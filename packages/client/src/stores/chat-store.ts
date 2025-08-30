import type { ChatMessage } from '@/lib/chat-api';
import { create } from 'zustand';

export interface Conversation {
  id: string;
  messages: ChatMessage[];
  title: string;
  createdAt: number;
  updatedAt: number;
}

interface ChatStore {
  conversations: Record<string, Conversation>;
  currentConversationId: string | null;
  isLoading: boolean;
  isStreaming: boolean;

  // Actions
  createConversation: () => string;
  setCurrentConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  updateMessage: (conversationId: string, messageIndex: number, content: string) => void;
  setLoading: (loading: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  deleteConversation: (id: string) => void;
  clearAllConversations: () => void;

  // Selectors
  getCurrentConversation: () => Conversation | null;
  getConversationsList: () => Conversation[];
}

const generateId = () => crypto.randomUUID();

const generateTitle = (messages: ChatMessage[]): string => {
  const firstUserMessage = messages.find((m) => m.role === 'user');
  if (firstUserMessage) {
    return (
      firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
    );
  }
  return `Chat ${new Date().toLocaleTimeString()}`;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: {},
  currentConversationId: null,
  isLoading: false,
  isStreaming: false,

  createConversation: () => {
    const id = generateId();
    const now = Date.now();
    const newConversation: Conversation = {
      id,
      messages: [],
      title: `New Chat`,
      createdAt: now,
      updatedAt: now,
    };

    console.log('Creating new conversation:', id);

    set((state) => ({
      conversations: { ...state.conversations, [id]: newConversation },
      currentConversationId: id,
    }));

    return id;
  },

  setCurrentConversation: (id: string | null) => {
    set({ currentConversationId: id });
  },

  addMessage: (conversationId: string, message: ChatMessage) => {
    set((state) => {
      const conversation = state.conversations[conversationId];
      if (!conversation) return state;

      const updatedMessages = [...conversation.messages, message];
      const updatedConversation: Conversation = {
        ...conversation,
        messages: updatedMessages,
        title:
          conversation.messages.length === 0 ? generateTitle(updatedMessages) : conversation.title,
        updatedAt: Date.now(),
      };

      return {
        conversations: {
          ...state.conversations,
          [conversationId]: updatedConversation,
        },
      };
    });
  },

  updateMessage: (conversationId: string, messageIndex: number, content: string) => {
    set((state) => {
      const conversation = state.conversations[conversationId];
      if (!conversation || !conversation.messages[messageIndex]) return state;

      const updatedMessages = [...conversation.messages];
      updatedMessages[messageIndex] = { ...updatedMessages[messageIndex], content };

      return {
        conversations: {
          ...state.conversations,
          [conversationId]: {
            ...conversation,
            messages: updatedMessages,
            updatedAt: Date.now(),
          },
        },
      };
    });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setStreaming: (streaming: boolean) => set({ isStreaming: streaming }),

  deleteConversation: (id: string) => {
    set((state) => {
      const { [id]: deleted, ...remaining } = state.conversations;
      return {
        conversations: remaining,
        currentConversationId:
          state.currentConversationId === id ? null : state.currentConversationId,
      };
    });
  },

  clearAllConversations: () => {
    set({
      conversations: {},
      currentConversationId: null,
    });
  },

  getCurrentConversation: () => {
    const { conversations, currentConversationId } = get();
    return currentConversationId ? conversations[currentConversationId] || null : null;
  },

  getConversationsList: () => {
    const { conversations } = get();
    return Object.values(conversations).sort((a, b) => b.updatedAt - a.updatedAt);
  },
}));
