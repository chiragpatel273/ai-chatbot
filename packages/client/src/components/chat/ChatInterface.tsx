import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatAPI, type ChatMessage as ChatMessageType } from '@/lib/chat-api';
import { useChatStore } from '@/stores/chat-store';
import { MessageSquare } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

export function ChatInterface() {
  const {
    getCurrentConversation,
    currentConversationId,
    createConversation,
    addMessage,
    updateMessage,
    isLoading,
    isStreaming,
    setStreaming,
  } = useChatStore();

  const currentConversation = getCurrentConversation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatAPI = ChatAPI.getInstance();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  // Debug: Log conversation changes
  useEffect(() => {
    if (currentConversation) {
      console.log('Current conversation changed:', {
        id: currentConversation.id,
        messageCount: currentConversation.messages.length,
        title: currentConversation.title,
      });
    }
  }, [currentConversation]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      let conversationId = currentConversationId;

      // Create new conversation if none exists
      if (!conversationId) {
        conversationId = createConversation();
      }

      // Add user message
      const userMessage: ChatMessageType = { role: 'user', content };
      addMessage(conversationId, userMessage);

      // Prepare messages for API
      const conversation = getCurrentConversation();
      const messages = conversation?.messages || [userMessage];

      try {
        setStreaming(true);

        // Add empty assistant message for streaming
        addMessage(conversationId, { role: 'assistant', content: '' });
        const assistantMessageIndex = conversation?.messages.length || 0; // Fixed: don't add 1

        let accumulatedContent = '';

        // Stream the response using callback approach
        await chatAPI.streamMessageCallback(
          {
            messages,
            conversationId: conversationId,
            temperature: 0.7,
            max_tokens: 2048,
          },
          (chunk) => {
            // Handle each streaming chunk
            if (chunk.content) {
              accumulatedContent += chunk.content;
              updateMessage(conversationId, assistantMessageIndex, accumulatedContent);
            } else if (chunk.error) {
              console.error('Streaming error:', chunk.error);
              updateMessage(
                conversationId,
                assistantMessageIndex,
                'Sorry, an error occurred while processing your request.',
              );
            }
          },
          () => {
            // Handle completion - streaming finished
          },
          (error) => {
            // Handle errors
            console.error('Chat streaming failed:', error);
            updateMessage(
              conversationId,
              assistantMessageIndex,
              'Sorry, an error occurred while processing your request.',
            );
          },
        );
      } catch (error) {
        console.error('Error sending message:', error);
        // Add error message
        addMessage(conversationId, {
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your request. Please try again.',
        });
      } finally {
        setStreaming(false);
      }
    },
    [
      currentConversationId,
      createConversation,
      addMessage,
      updateMessage,
      getCurrentConversation,
      setStreaming,
      chatAPI,
    ],
  );

  return (
    <div className="flex h-screen max-h-screen bg-background">
      {/* Conversation List Sidebar */}
      <ConversationList />

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="flex items-center p-4 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">
              {currentConversation?.title || 'AI Chatbot'}
            </h1>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-auto px-4 py-6 bg-muted/5">
          {!currentConversation?.messages.length ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4 max-w-md">
                <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto">
                  <MessageSquare className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Welcome to AI Chatbot</h2>
                <p className="text-muted-foreground/80">
                  Start a conversation by typing a message below. I'm here to help with any
                  questions or tasks you have!
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {currentConversation.messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  message={message}
                  isStreaming={isStreaming && index === currentConversation.messages.length - 1}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          isLoading={isStreaming}
          placeholder={isStreaming ? 'AI is typing...' : 'Type your message...'}
        />
      </div>
    </div>
  );
}
