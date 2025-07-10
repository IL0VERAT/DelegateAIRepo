/**
 * Community Announcements Component
 * =================================
 * 
 * Displays community announcements on the login page right side
 * Controlled by admin console with full CRUD operations
 * Features: Priority levels, expiration dates, rich formatting, darker blue background
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  Bell, 
  Pin, 
  Calendar, 
  Users, 
  TrendingUp, 
  AlertCircle,
  Info,
  CheckCircle,
  Star,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isPinned: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  targetAudience: 'all' | 'new-users' | 'existing-users';
  author: string;
}

interface CommunityAnnouncementsProps {
  className?: string;
}

// Mock data service - In production, this would be an API call
const announcementService = {
  getAnnouncements: (): Announcement[] => {
    try {
      const stored = localStorage.getItem('delegate-ai-announcements');
      return stored ? JSON.parse(stored) : getDefaultAnnouncements();
    } catch {
      return getDefaultAnnouncements();
    }
  },

  saveAnnouncements: (announcements: Announcement[]): void => {
    try {
      localStorage.setItem('delegate-ai-announcements', JSON.stringify(announcements));
    } catch (error) {
      console.error('Failed to save announcements:', error);
    }
  }
};

function getDefaultAnnouncements(): Announcement[] {
  return [
    {
      id: '1',
      title: 'Welcome to Delegate AI Beta!',
      content: 'Experience the future of diplomatic training with our AI-powered Model UN simulations. Try our voice-driven negotiations and interactive campaigns.',
      type: 'info',
      priority: 'high',
      isPinned: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      targetAudience: 'new-users',
      author: 'Delegate AI Team'
    },
    {
      id: '2',
      title: 'New Campaign: Climate Crisis Summit',
      content: 'Join our latest 45-minute campaign tackling global climate challenges. Practice diplomatic negotiations with AI delegates from 193+ countries.',
      type: 'success',
      priority: 'medium',
      isPinned: false,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      targetAudience: 'all',
      author: 'Campaign Team'
    },
    {
      id: '3',
      title: 'Voice Features Enhanced',
      content: 'Our voice recognition and AI speech synthesis have been improved for more natural diplomatic conversations. Try the new voice commands!',
      type: 'info',
      priority: 'medium',
      isPinned: false,
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      targetAudience: 'existing-users',
      author: 'Development Team'
    }
  ];
}

const typeIcons = {
  info: Info,
  warning: AlertCircle,
  success: CheckCircle,
  urgent: AlertCircle
};

const typeColors = {
  info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  warning: 'border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  success: 'border-green-200 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300',
  urgent: 'border-red-200 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300'
};

const priorityBadgeColors = {
  low: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600',
  medium: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  high: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
  urgent: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700'
};

export function CommunityAnnouncements({ className = '' }: CommunityAnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [expandedAnnouncements, setExpandedAnnouncements] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = () => {
    setIsLoading(true);
    try {
      const loadedAnnouncements = announcementService.getAnnouncements();
      const activeAnnouncements = loadedAnnouncements
        .filter(announcement => {
          if (!announcement.isActive) return false;
          if (announcement.expiresAt) {
            const expiryDate = new Date(announcement.expiresAt);
            if (expiryDate < new Date()) return false;
          }
          return true;
        })
        .sort((a, b) => {
          // Sort by pinned first, then by priority, then by date
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
          if (priorityDiff !== 0) return priorityDiff;
          
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      
      setAnnouncements(activeAnnouncements);
    } catch (error) {
      console.error('Failed to load announcements:', error);
      setAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpanded = (announcementId: string) => {
    setExpandedAnnouncements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(announcementId)) {
        newSet.delete(announcementId);
      } else {
        newSet.add(announcementId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return hours === 0 ? 'Just now' : `${hours}h ago`;
    } else if (diffInHours < 168) {
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <div className={`relative h-full overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#2563eb] dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#334155]" />
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/70"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full overflow-hidden ${className}`}>
      {/* Darker Blue Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#2563eb] dark:from-[#0c1426] dark:via-[#1e2951] dark:to-[#2940759]" />
      
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.05]" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), 
                         radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)`
      }} />
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Community Updates
              </h2>
              <p className="text-sm text-white/70">
                Latest news and announcements
              </p>
            </div>
          </div>
        </div>

        {/* Announcements */}
        <ScrollArea className="flex-1">
          <div className="space-y-4 pr-4">
            {announcements.length === 0 ? (
              <Card className="bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20">
                <CardContent className="pt-6 text-center">
                  <Bell className="w-12 h-12 text-white/60 mx-auto mb-3" />
                  <p className="text-white/80">
                    No announcements at the moment
                  </p>
                  <p className="text-sm text-white/60 mt-1">
                    Check back later for updates
                  </p>
                </CardContent>
              </Card>
            ) : (
              announcements.map((announcement, index) => {
                const IconComponent = typeIcons[announcement.type];
                const isExpanded = expandedAnnouncements.has(announcement.id);
                const shouldTruncate = announcement.content.length > 120;
                
                return (
                  <Card 
                    key={announcement.id}
                    className={`bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 transition-all duration-200 hover:bg-white/15 hover:border-white/30 ${
                      announcement.isPinned ? 'ring-2 ring-white/30' : ''
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${typeColors[announcement.type]} bg-white/20 border border-white/30`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {announcement.isPinned && (
                                <Pin className="w-4 h-4 text-white/80" />
                              )}
                              <CardTitle className="text-sm font-medium line-clamp-2 text-white">
                                {announcement.title}
                              </CardTitle>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-white/60">
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(announcement.createdAt)}</span>
                              <Separator orientation="vertical" className="h-3 bg-white/30" />
                              <span>{announcement.author}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <Badge 
                            variant="outline" 
                            className={`text-xs border-white/30 bg-white/10 text-white/80`}
                          >
                            {announcement.priority}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <p className={`text-sm text-white/80 leading-relaxed ${
                          !isExpanded && shouldTruncate ? 'line-clamp-3' : ''
                        }`}>
                          {announcement.content}
                        </p>
                        
                        {shouldTruncate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(announcement.id)}
                            className="h-auto p-0 text-xs text-white/70 hover:text-white hover:bg-transparent"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-3 h-3 mr-1" />
                                Show less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3 mr-1" />
                                Read more
                              </>
                            )}
                          </Button>
                        )}
                        
                        {announcement.expiresAt && (
                          <div className="flex items-center gap-1 text-xs text-white/60">
                            <Calendar className="w-3 h-3" />
                            <span>Expires {formatDate(announcement.expiresAt)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between text-xs text-white/60">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>Community Hub</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>{announcements.length} active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export the announcement service for admin use
export { announcementService };