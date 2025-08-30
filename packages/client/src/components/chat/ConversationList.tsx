import { Button } from '@/components/ui/button';
import { useChatStore } from '@/stores/chat-store';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';

export function ConversationList() {
  const {
    getConversationsList,
    currentConversationId,
    setCurrentConversation,
    createConversation,
    deleteConversation,
  } = useChatStore();

  const conversations = getConversationsList();

  const handleNewConversation = () => {
    createConversation();
  };

  const handleSelectConversation = (conversationId: string) => {
    console.log('Switching to conversation:', conversationId);
    setCurrentConversation(conversationId);
  };

  const handleDeleteConversation = (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the select conversation
    if (confirm('Are you sure you want to delete this conversation?')) {
      deleteConversation(conversationId);
    }
  };

  return (
    <div className="w-64 border-r bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-muted/30">
        <Button onClick={handleNewConversation} className="w-full shadow-sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2 bg-muted/10">
        {conversations.length === 0 ? (
          <div className="text-center text-muted-foreground p-6">
            <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No conversations yet</p>
            <p className="text-xs mt-1 opacity-70">Start a new chat to begin</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <div key={conversation.id} className="relative group">
                <Button
                  onClick={() => handleSelectConversation(conversation.id)}
                  variant={currentConversationId === conversation.id ? 'secondary' : 'ghost'}
                  className={`w-full justify-start text-left h-auto p-3 pr-10 transition-all hover:bg-muted/70 ${
                    currentConversationId === conversation.id
                      ? 'bg-muted border border-border/50 shadow-sm'
                      : 'hover:bg-muted/40'
                  }`}
                >
                  <div className="flex flex-col items-start max-w-full">
                    <div className="font-medium truncate max-w-full text-foreground">
                      {conversation.title}
                    </div>
                    <div className="text-xs text-muted-foreground/70 mt-0.5">
                      {new Date(conversation.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </Button>

                {/* Delete button - shown on hover */}
                <Button
                  onClick={(e) => handleDeleteConversation(conversation.id, e)}
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
