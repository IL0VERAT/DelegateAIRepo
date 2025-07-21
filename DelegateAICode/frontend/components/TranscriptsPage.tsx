import { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { useTranscriptSEO } from './DynamicSEO';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  MessageSquare, 
  Mic, 
  Clock, 
  Calendar,
  FileText,
  Eye,
  AlertCircle,
  SortDesc,
  SortAsc
} from 'lucide-react';

export function TranscriptsPage() {
  const appContext = useApp();
  
  // Safe access to transcripts with fallback to empty array
  const transcripts = appContext?.transcripts || [];
  const deleteTranscript = appContext?.deleteTranscript || (() => {});
  
  // State for filtering and searching
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'chat' | 'voice'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTranscript, setSelectedTranscript] = useState<string | null>(null);

  // SEO optimization for transcripts page
  useTranscriptSEO(
    selectedTranscript ? transcripts.find(t => t.id === selectedTranscript)?.title : undefined,
    selectedTranscript ? transcripts.find(t => t.id === selectedTranscript)?.type : undefined
  );

  // Filter and sort transcripts - with safe array access
  const filteredTranscripts = transcripts
    .filter(transcript => {
      if (!transcript) return false;
      
      const matchesSearch = searchQuery === '' || 
        (transcript.title && transcript.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (transcript.messages && Array.isArray(transcript.messages) && 
         transcript.messages.some(msg => 
           msg && msg.content && msg.content.toLowerCase().includes(searchQuery.toLowerCase())
         ));
      
      const matchesType = filterType === 'all' || transcript.type === filterType;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case 'title':
          const titleA = a.title || '';
          const titleB = b.title || '';
          comparison = titleA.localeCompare(titleB);
          break;
        case 'type':
          const typeA = a.type || '';
          const typeB = b.type || '';
          comparison = typeA.localeCompare(typeB);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Export transcript as JSON
  const exportTranscript = (transcript: any) => {
    if (!transcript) return;
    
    try {
      const blob = new Blob([JSON.stringify(transcript, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const title = transcript.title || 'transcript';
      a.download = `transcript-${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting transcript:', error);
    }
  };

  // Export transcript as text
  const exportTranscriptAsText = (transcript: any) => {
    if (!transcript) return;
    
    try {
      const title = transcript.title || 'Untitled';
      const type = transcript.type || 'unknown';
      const createdAt = transcript.createdAt || new Date().toISOString();
      const messages = transcript.messages || [];
      
      const textContent = [
        title,
        `Type: ${type}`,
        `Created: ${new Date(createdAt).toLocaleString()}`,
        `Messages: ${messages.length}`,
        '',
        '--- CONVERSATION ---',
        '',
        ...messages.map((msg: any) => {
          if (!msg) return '';
          const sender = msg.sender === 'user' ? 'You' : 'Delegate AI';
          const content = msg.content || '';
          return `${sender}: ${content}`;
        }).filter(line => line !== '')
      ].join('\n');
      
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcript-${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting transcript as text:', error);
    }
  };

  // Format date with safe access
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (days === 0) return 'Today';
      if (days === 1) return 'Yesterday';
      if (days < 7) return `${days} days ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Get type badge with safe access
  const getTypeBadge = (type: string) => {
    const config = {
      chat: { 
        icon: MessageSquare, 
        color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30' 
      },
      voice: { 
        icon: Mic, 
        color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30' 
      },
      'voice-session': { 
        icon: Mic, 
        color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30' 
      }
    };
    
    const typeConfig = config[type as keyof typeof config] || config.chat;
    const Icon = typeConfig.icon;
    
    return (
      <Badge className={typeConfig.color} variant="secondary">
        <Icon className="h-3 w-3 mr-1" />
        {type === 'voice-session' ? 'Voice' : (type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown')}
      </Badge>
    );
  };

  // Safe message count calculation
  const getMessageCount = (transcript: any) => {
    if (!transcript || !transcript.messages || !Array.isArray(transcript.messages)) {
      return 0;
    }
    return transcript.messages.length;
  };

  // Safe chat conversations count
  const getChatCount = () => {
    return transcripts.filter(t => t && t.type === 'chat').length;
  };

  // Safe voice sessions count
  const getVoiceCount = () => {
    return transcripts.filter(t => t && (t.type === 'voice' || t.type === 'voice-session')).length;
  };

  // Safe total messages count
  const getTotalMessages = () => {
    return transcripts.reduce((total, t) => {
      if (!t || !t.messages || !Array.isArray(t.messages)) {
        return total;
      }
      return total + t.messages.length;
    }, 0);
  };

  return (
    <div className="container-responsive py-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-blue/10">
            <FileText className="h-5 w-5 text-brand-blue" />
          </div>
          <h1 className="text-2xl font-semibold">Conversation Transcripts</h1>
        </div>
        <p className="text-muted-foreground">
          View, search, and manage your AI conversation history
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Chat Conversations</span>
            </div>
            <p className="text-2xl font-semibold mt-1">
              {getChatCount()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Voice Sessions</span>
            </div>
            <p className="text-2xl font-semibold mt-1">
              {getVoiceCount()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-muted-foreground">Total Messages</span>
            </div>
            <p className="text-2xl font-semibold mt-1">
              {getTotalMessages()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transcripts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Type Filter */}
            <div className="space-y-2">
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="chat">Chat Only</SelectItem>
                  <SelectItem value="voice">Voice Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Sort */}
            <div className="space-y-2">
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [newSortBy, newSortOrder] = value.split('-');
                setSortBy(newSortBy as any);
                setSortOrder(newSortOrder as any);
              }}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  {sortOrder === 'desc' ? 
                    <SortDesc className="h-4 w-4 mr-2" /> : 
                    <SortAsc className="h-4 w-4 mr-2" />
                  }
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                  <SelectItem value="type-asc">Type A-Z</SelectItem>
                  <SelectItem value="type-desc">Type Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No Transcripts */}
      {transcripts.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No conversation transcripts found. Start chatting or using voice mode to create transcripts.
          </AlertDescription>
        </Alert>
      )}

      {/* No Filtered Results */}
      {transcripts.length > 0 && filteredTranscripts.length === 0 && (
        <Alert>
          <Search className="h-4 w-4" />
          <AlertDescription>
            No transcripts match your current search and filter criteria. Try adjusting your filters.
          </AlertDescription>
        </Alert>
      )}

      {/* Transcripts List */}
      {filteredTranscripts.length > 0 && (
        <div className="space-y-4">
          {filteredTranscripts.map((transcript) => {
            if (!transcript || !transcript.id) return null;
            
            return (
              <Card key={transcript.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium line-clamp-1">{transcript.title || 'Untitled'}</h3>
                        {getTypeBadge(transcript.type || 'unknown')}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(transcript.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {transcript.createdAt ? new Date(transcript.createdAt).toLocaleTimeString() : 'Unknown time'}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {getMessageCount(transcript)} messages
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTranscript(
                          selectedTranscript === transcript.id ? null : transcript.id
                        )}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {selectedTranscript === transcript.id ? 'Hide' : 'View'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => exportTranscriptAsText(transcript)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTranscript(transcript.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {/* Transcript Content */}
                {selectedTranscript === transcript.id && (
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {transcript.messages && Array.isArray(transcript.messages) ? 
                        transcript.messages.map((message, index) => {
                          if (!message) return null;
                          
                          return (
                            <div key={index} className="flex gap-3">
                              <div className="flex-shrink-0">
                                {message.sender === 'user' ? (
                                  <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-medium">
                                    U
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-medium">
                                    AI
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {message.sender === 'user' ? 'You' : 'Delegate AI'}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : 'Unknown time'}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {message.content || ''}
                                </p>
                              </div>
                            </div>
                          );
                        }).filter(Boolean) : (
                          <div className="text-sm text-muted-foreground">
                            No messages found in this transcript.
                          </div>
                        )
                      }
                    </div>
                    
                    {/* Export Options */}
                    <Separator className="my-4" />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportTranscriptAsText(transcript)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Export as Text
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportTranscript(transcript)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Export as JSON
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}