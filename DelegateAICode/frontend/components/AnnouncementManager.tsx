/**
 * Announcement Manager Component for Admin Console
 * ===============================================
 * 
 * Provides full CRUD operations for community announcements
 * Features: Create, edit, delete, priority management, scheduling
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from './ui/dialog';
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  Pin, 
  Calendar, 
  Users, 
  AlertCircle,
  Info,
  CheckCircle,
  Save,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { Announcement, announcementService } from './CommunityAnnouncements';

interface AnnouncementFormData {
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isPinned: boolean;
  expiresAt: string;
  isActive: boolean;
  targetAudience: 'all' | 'new-users' | 'existing-users';
}

const emptyFormData: AnnouncementFormData = {
  title: '',
  content: '',
  type: 'info',
  priority: 'medium',
  isPinned: false,
  expiresAt: '',
  isActive: true,
  targetAudience: 'all'
};

const typeOptions = [
  { value: 'info', label: 'Information', icon: Info, color: 'text-blue-600' },
  { value: 'warning', label: 'Warning', icon: AlertCircle, color: 'text-orange-600' },
  { value: 'success', label: 'Success', icon: CheckCircle, color: 'text-green-600' },
  { value: 'urgent', label: 'Urgent', icon: AlertCircle, color: 'text-red-600' }
];

const priorityOptions = [
  { value: 'low', label: 'Low Priority', color: 'text-gray-600' },
  { value: 'medium', label: 'Medium Priority', color: 'text-blue-600' },
  { value: 'high', label: 'High Priority', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgent Priority', color: 'text-red-600' }
];

const audienceOptions = [
  { value: 'all', label: 'All Users' },
  { value: 'new-users', label: 'New Users Only' },
  { value: 'existing-users', label: 'Existing Users Only' }
];

export function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<AnnouncementFormData>(emptyFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = () => {
    setIsLoading(true);
    try {
      const loadedAnnouncements = announcementService.getAnnouncements();
      setAnnouncements(loadedAnnouncements.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      setError('Failed to load announcements');
      console.error('Failed to load announcements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingAnnouncement(null);
    setFormData(emptyFormData);
    setIsDialogOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      priority: announcement.priority,
      isPinned: announcement.isPinned,
      expiresAt: announcement.expiresAt || '',
      isActive: announcement.isActive,
      targetAudience: announcement.targetAudience
    });
    setIsDialogOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const updatedAnnouncements = announcements.filter(a => a.id !== announcementId);
      announcementService.saveAnnouncements(updatedAnnouncements);
      setAnnouncements(updatedAnnouncements);
      setSuccess('Announcement deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('Failed to delete announcement');
      console.error('Failed to delete announcement:', error);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleToggleActive = (announcementId: string) => {
    try {
      const updatedAnnouncements = announcements.map(a => 
        a.id === announcementId 
          ? { ...a, isActive: !a.isActive, updatedAt: new Date().toISOString() }
          : a
      );
      announcementService.saveAnnouncements(updatedAnnouncements);
      setAnnouncements(updatedAnnouncements);
      setSuccess('Announcement status updated');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('Failed to update announcement status');
      console.error('Failed to update announcement status:', error);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      const now = new Date().toISOString();
      
      if (editingAnnouncement) {
        // Update existing announcement
        const updatedAnnouncements = announcements.map(a => 
          a.id === editingAnnouncement.id 
            ? {
                ...a,
                ...formData,
                expiresAt: formData.expiresAt || undefined,
                updatedAt: now
              }
            : a
        );
        announcementService.saveAnnouncements(updatedAnnouncements);
        setAnnouncements(updatedAnnouncements);
        setSuccess('Announcement updated successfully');
      } else {
        // Create new announcement
        const newAnnouncement: Announcement = {
          id: Date.now().toString(),
          ...formData,
          expiresAt: formData.expiresAt || undefined,
          createdAt: now,
          updatedAt: now,
          author: 'Admin' // In production, this would be the actual admin user
        };
        
        const updatedAnnouncements = [newAnnouncement, ...announcements];
        announcementService.saveAnnouncements(updatedAnnouncements);
        setAnnouncements(updatedAnnouncements);
        setSuccess('Announcement created successfully');
      }
      
      setIsDialogOpen(false);
      setFormData(emptyFormData);
      setEditingAnnouncement(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('Failed to save announcement');
      console.error('Failed to save announcement:', error);
      setTimeout(() => setError(null), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTypeIcon = (type: string) => {
    const typeOption = typeOptions.find(t => t.value === type);
    return typeOption ? typeOption.icon : Info;
  };

  const getTypeColor = (type: string) => {
    const typeOption = typeOptions.find(t => t.value === type);
    return typeOption ? typeOption.color : 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Community Announcements
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage announcements displayed on the login page
          </p>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Announcement
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Announcements List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Announcements ({announcements.length})</span>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{announcements.filter(a => a.isActive).length} active</span>
              <Separator orientation="vertical" className="h-4" />
              <span>{announcements.filter(a => a.isPinned).length} pinned</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No announcements yet</p>
              <p className="text-sm text-gray-500 mt-1">Create your first announcement to get started</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {announcements.map((announcement) => {
                  const TypeIcon = getTypeIcon(announcement.type);
                  const isExpired = announcement.expiresAt && new Date(announcement.expiresAt) < new Date();
                  
                  return (
                    <div 
                      key={announcement.id}
                      className={`border rounded-lg p-4 transition-all ${
                        announcement.isActive && !isExpired
                          ? 'border-gray-200 dark:border-gray-700' 
                          : 'border-gray-100 dark:border-gray-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <TypeIcon className={`w-4 h-4 ${getTypeColor(announcement.type)}`} />
                            {announcement.isPinned && (
                              <Pin className="w-4 h-4 text-blue-600" />
                            )}
                            <h3 className="font-medium truncate">{announcement.title}</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {announcement.priority}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {announcement.targetAudience}
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                            {announcement.content}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Created: {formatDate(announcement.createdAt)}</span>
                            {announcement.expiresAt && (
                              <>
                                <Separator orientation="vertical" className="h-3" />
                                <span className={isExpired ? 'text-red-600' : ''}>
                                  Expires: {formatDate(announcement.expiresAt)}
                                  {isExpired && ' (Expired)'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(announcement.id)}
                            className="p-2"
                          >
                            {announcement.isActive ? (
                              <Eye className="w-4 h-4 text-green-600" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(announcement)}
                            className="p-2"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(announcement.id)}
                            className="p-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
            </DialogTitle>
            <DialogDescription>
              {editingAnnouncement 
                ? 'Update the announcement details below'
                : 'Create a new announcement for the community'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter announcement title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className={`w-4 h-4 ${option.color}`} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter announcement content"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className={option.color}>{option.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Select value={formData.targetAudience} onValueChange={(value: any) => setFormData({ ...formData, targetAudience: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {audienceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires">Expiration Date (Optional)</Label>
              <Input
                id="expires"
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="pinned"
                    checked={formData.isPinned}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPinned: checked })}
                  />
                  <Label htmlFor="pinned" className="flex items-center gap-2">
                    <Pin className="w-4 h-4" />
                    Pin to top
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="active" className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Active
                  </Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                {editingAnnouncement ? 'Update' : 'Create'} Announcement
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}