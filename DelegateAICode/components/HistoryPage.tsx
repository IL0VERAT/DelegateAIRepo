import { useState } from 'react';
import { useApp } from './AppContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  MessageSquare, 
  Trash2, 
  Search, 
  Calendar,
  User,
  Bot,
  Mic,
  Eye
} from 'lucide-react';
import { Separator } from './ui/separator';
import { ChatSession, Transcript } from '../types/api';

type ConversationItem = {
  id: string;
  title: string;
  type: 'chat' | 'voice';
  updatedAt: string;
  createdAt: string;
  messageCount: number;
  preview?: string;
  status?: string;
};

export function HistoryPage() {
  const { 
    chatSessions, 
    transcripts,
    selectChatSession, 
    deleteChatSession,
    deleteTranscript,
    setCurrentView 
  } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'chat' | 'voice'>('all');

  // Combine chat sessions and voice transcripts into a unified list
  const getAllConversations = (): ConversationItem[] => {
    const chatItems: ConversationItem[] = (chatSessions || []).map(session => ({
      id: session.id,
      title: session.title,
      type: 'chat' as const,
      updatedAt: session.updatedAt,
      createdAt: session.createdAt,
      messageCount: session.messageCount || 0,
      preview: session.lastMessage || session.preview,
    }));

    const voiceItems: ConversationItem[] = (transcripts || [])
      .filter(transcript => transcript.type === 'voice')
      .map(transcript => ({
        id: transcript.id,
        title: transcript.title,
        type: 'voice' as const,
        updatedAt: transcript.updatedAt,
        createdAt: transcript.createdAt,
        messageCount: transcript.messageCount || 0,
        status: transcript.status,
      }));

    return [...chatItems, ...voiceItems].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  };

  // Filter conversations by search query and tab
  const getFilteredConversations = () => {
    let conversations = getAllConversations();
    
    // Filter by tab
    if (activeTab !== 'all') {
      conversations = conversations.filter(conv => conv.type === activeTab);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const lowercaseQuery = searchQuery.toLowerCase();
      conversations = conversations.filter(conv => 
        conv.title.toLowerCase().includes(lowercaseQuery) ||
        (conv.preview && conv.preview.toLowerCase().includes(lowercaseQuery))
      );
    }
    
    return conversations;
  };

  const filteredConversations = getFilteredConversations();

  // Get counts for tabs
  const getConversationCounts = () => {
    const all = getAllConversations();
    return {
      all: all.length,
      chat: all.filter(c => c.type === 'chat').length,
      voice: all.filter(c => c.type === 'voice').length,
    };
  };

  const counts = getConversationCounts();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMessagePreview = (conversation: ConversationItem) => {
    if (conversation.preview) {
      return conversation.preview.slice(0, 100) + (conversation.preview.length > 100 ? '...' : '');
    }
    return conversation.type === 'voice' ? 'Voice conversation completed' : 'No messages yet';
  };

  const groupConversationsByDate = (conversations: ConversationItem[]) => {
    const groups: { [key: string]: ConversationItem[] } = {};
    
    conversations.forEach(conversation => {
      const date = new Date(conversation.updatedAt).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(conversation);
    });

    return groups;
  };

  const conversationGroups = groupConversationsByDate(filteredConversations);

  const handleOpenConversation = async (conversation: ConversationItem) => {
    try {
      if (conversation.type === 'chat') {
        await selectChatSession(conversation.id);
        setCurrentView('chat');
      } else {
        // For voice conversations, go to transcripts page
        setCurrentView('transcripts');
      }
    } catch (error) {
      console.error('Failed to open conversation:', error);
    }
  };

  const handleDeleteConversation = async (conversation: ConversationItem) => {
    try {
      if (conversation.type === 'chat') {
        await deleteChatSession(conversation.id);
      } else {
        await deleteTranscript(conversation.id);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-medium mb-2">Conversation History</h1>
        <p className="text-muted-foreground">
          Browse and manage your past chat and voice conversations
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Badge variant="secondary">
          {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'chat' | 'voice')}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">
            All ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageSquare className="w-4 h-4 mr-1" />
            Chat ({counts.chat})
          </TabsTrigger>
          <TabsTrigger value="voice">
            <Mic className="w-4 h-4 mr-1" />
            Voice ({counts.voice})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredConversations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                {activeTab === 'chat' ? (
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                ) : activeTab === 'voice' ? (
                  <Mic className="h-12 w-12 text-muted-foreground mb-4" />
                ) : (
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                )}
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? `No ${activeTab === 'all' ? '' : activeTab + ' '}conversations match your search` 
                    : `No ${activeTab === 'all' ? '' : activeTab + ' '}conversations yet`
                  }
                </p>
                {!searchQuery && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {activeTab === 'chat' 
                      ? 'Start a new chat conversation to see it appear here'
                      : activeTab === 'voice'
                      ? 'Start a new voice conversation to see it appear here'
                      : 'Start a new conversation to see it appear here'
                    }
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(conversationGroups).map(([date, conversationsForDate]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">{new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}</h3>
                  </div>
                  
                  <div className="grid gap-4">
                    {conversationsForDate.map((conversation) => (
                      <Card key={conversation.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <CardTitle className="text-base truncate">{conversation.title}</CardTitle>
                                <Badge 
                                  variant={conversation.type === 'voice' ? 'default' : 'secondary'} 
                                  className="gap-1"
                                >
                                  {conversation.type === 'voice' ? (
                                    <Mic className="h-3 w-3" />
                                  ) : (
                                    <MessageSquare className="h-3 w-3" />
                                  )}
                                  {conversation.type}
                                </Badge>
                                {conversation.status && conversation.status !== 'completed' && (
                                  <Badge variant="outline" className="text-xs">
                                    {conversation.status}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(conversation.updatedAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Badge variant="outline" className="gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {conversation.messageCount}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleOpenConversation(conversation)}
                              >
                                {conversation.type === 'voice' ? (
                                  <>
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </>
                                ) : (
                                  'Open'
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteConversation(conversation)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {getMessagePreview(conversation)}
                            </p>
                            
                            <Separator />
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  {conversation.messageCount} messages
                                </span>
                                <span className="flex items-center gap-1">
                                  {conversation.type === 'voice' ? (
                                    <Mic className="h-3 w-3" />
                                  ) : (
                                    <MessageSquare className="h-3 w-3" />
                                  )}
                                  {conversation.type} conversation
                                </span>
                              </div>
                              <span>
                                Last updated: {new Date(conversation.updatedAt).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}