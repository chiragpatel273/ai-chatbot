import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  isLoading = false,
  placeholder = 'Type your message...',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      resetTextareaHeight();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 120; // ~6 lines
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  return (
    <div className="border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <form onSubmit={handleSubmit} className="flex gap-3 p-4">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className={cn(
              'w-full resize-none rounded-xl border border-input bg-background px-4 py-3 shadow-sm',
              'text-sm placeholder:text-muted-foreground/60',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'min-h-[48px] max-h-[120px] transition-colors',
            )}
            rows={1}
          />
        </div>
        <div className="flex items-center pb-1">
          <Button
            type="submit"
            disabled={!message.trim() || disabled || isLoading}
            className={cn(
              'h-10 w-10 rounded-xl p-0 flex-shrink-0 shadow-sm transition-all',
              message.trim() && !disabled && !isLoading
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground',
            )}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
