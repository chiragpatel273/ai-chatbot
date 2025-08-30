import type { ChatMessage as ChatMessageType } from '@/lib/chat-api';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center mb-4">
        <div className="bg-muted text-muted-foreground text-sm px-4 py-2 rounded-lg max-w-md text-center">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex gap-3 mb-6', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
        </div>
      )}

      <div className={cn('flex flex-col', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'max-w-[70%] px-4 py-3 rounded-2xl break-words',
            isUser ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted text-foreground',
          )}
        >
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {isUser ? message.content : <ReactMarkdown>{message.content}</ReactMarkdown>}
            {isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />}
          </div>
        </div>
        <span className="text-xs text-muted-foreground mt-1 px-1">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
}
