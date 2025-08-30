import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  conversationId?: string;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface ChatResponse {
  content: string;
  conversationId: string;
  raw?: any;
}

export interface StreamChunk {
  content?: string;
  type?: string;
  conversationId?: string;
  error?: string;
}

export class ChatAPI {
  private static instance: ChatAPI;

  static getInstance(): ChatAPI {
    if (!ChatAPI.instance) {
      ChatAPI.instance = new ChatAPI();
    }
    return ChatAPI.instance;
  }

  // Simple test function for debugging SSE
  async testStream(): Promise<void> {
    console.log('Testing basic SSE connection...');

    // Note: Using fetch for streaming as axios doesn't handle browser streams properly
    const response = await fetch(`${API_BASE_URL}/test/stream-test`, {
      method: 'GET',
      headers: {
        Accept: 'text/event-stream',
      },
    });

    console.log('Test stream response:', response.status, response.headers);

    if (!response.ok) {
      throw new Error(`Test stream failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('Test stream completed');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        console.log('Test buffer:', buffer);

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          console.log('Test line:', trimmed);

          if (trimmed.startsWith('data:')) {
            const data = trimmed.substring(5).trim();
            console.log('Test data:', data);

            try {
              const parsed = JSON.parse(data);
              console.log('Test parsed:', parsed);
              if (parsed.type === 'done') return;
            } catch (err) {
              console.warn('Test parse error:', err);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await apiClient.post('/chat', {
        ...request,
        stream: false,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Chat request failed: ${error.response?.status || error.message}`);
      }
      throw error;
    }
  }

  async *streamMessage(request: ChatRequest): AsyncGenerator<StreamChunk, void, unknown> {
    // Note: Using fetch for streaming as axios doesn't handle browser streams properly
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        ...request,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Streaming request failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();

          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const data = trimmed.substring(5).trim();

          if (data === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(data) as StreamChunk;
            yield parsed;
          } catch (err) {
            console.warn('Failed to parse SSE chunk:', data, err);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // Alternative streaming method with callback approach
  async streamMessageCallback(
    request: ChatRequest,
    onChunk: (chunk: StreamChunk) => void,
    onComplete: () => void,
    onError: (error: Error) => void,
  ): Promise<void> {
    try {
      // Note: Using fetch for streaming as axios doesn't handle browser streams properly
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          ...request,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Streaming request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onComplete();
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();

          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const data = trimmed.substring(5).trim();

          if (data === '[DONE]') {
            onComplete();
            return;
          }

          try {
            const parsed = JSON.parse(data) as StreamChunk;
            onChunk(parsed);
          } catch (err) {
            console.warn('Failed to parse SSE chunk:', data, err);
          }
        }
      }

      reader.releaseLock();
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Unknown streaming error'));
    }
  }

  // Additional axios-based methods for API interactions
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Health check failed: ${error.response?.status || error.message}`);
      }
      throw error;
    }
  }

  async getConversationHistory(conversationId: string): Promise<ChatMessage[]> {
    try {
      const response = await apiClient.get(`/conversations/${conversationId}`);
      return response.data.messages || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get conversation: ${error.response?.status || error.message}`);
      }
      throw error;
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      await apiClient.delete(`/conversations/${conversationId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to delete conversation: ${error.response?.status || error.message}`,
        );
      }
      throw error;
    }
  }
}

export const chatAPI = ChatAPI.getInstance();
