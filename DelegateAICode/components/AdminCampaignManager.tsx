/**
 * ADMIN CAMPAIGN MANAGER - FULL CRUD WITH DOCUMENT UPLOAD
 * ======================================================
 * 
 * Comprehensive campaign management interface for administrators with:
 * - Full CRUD operations (Create, Read, Update, Delete)
 * - Document upload and AI processing
 * - Publication status management
 * - AI-assisted campaign building
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Edit3, Trash2, Save, X, Upload, FileText, Eye, EyeOff,
  Clock, Users, Globe, Shield, AlertTriangle, Briefcase, Heart, Leaf,
  Target, Calendar, MapPin, Award, ChevronDown, ChevronRight,
  Download, Zap, Settings, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { adminCampaignService } from '../services/adminCampaignService';
import { logger } from '../utils/logger';
import type {
  CampaignTemplate,
  CampaignDocument
} from "../services/campaigns";

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================


interface DocumentUploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  analysis?: any;
}

// ============================================================================
// CAMPAIGN ICONS MAPPING
// ============================================================================

const CAMPAIGN_ICONS = {
  leaf: { icon: 'Leaf', color: 'text-green-600', bgGradient: 'from-green-500 to-emerald-600' },
  heart: { icon: 'Heart', color: 'text-red-600', bgGradient: 'from-red-500 to-rose-600' },
  shield: { icon: 'Shield', color: 'text-blue-600', bgGradient: 'from-blue-500 to-indigo-600' },
  briefcase: { icon: 'Briefcase', color: 'text-orange-600', bgGradient: 'from-orange-500 to-amber-600' },
  alertTriangle: { icon: 'AlertTriangle', color: 'text-yellow-600', bgGradient: 'from-yellow-500 to-orange-500' },
  globe: { icon: 'Globe', color: 'text-purple-600', bgGradient: 'from-purple-500 to-violet-600' },
  users: { icon: 'Users', color: 'text-indigo-600', bgGradient: 'from-indigo-500 to-purple-600' },
  target: { icon: 'Target', color: 'text-pink-600', bgGradient: 'from-pink-500 to-rose-600' }
};

const CATEGORIES = [
  { id: 'crisis', name: 'Crisis Management', icon: 'alertTriangle' },
  { id: 'negotiation', name: 'Negotiations', icon: 'target' },
  { id: 'security', name: 'Security', icon: 'shield' },
  { id: 'humanitarian', name: 'Humanitarian', icon: 'heart' },
  { id: 'economic', name: 'Economic', icon: 'briefcase' },
  { id: 'environmental', name: 'Environmental', icon: 'leaf' },
  { id: 'political', name: 'Political', icon: 'users' },
  { id: 'social', name: 'Social', icon: 'globe' }
];

const DIFFICULTIES = [
  { id: 'beginner', name: 'Beginner', color: 'text-green-600 bg-green-50' },
  { id: 'intermediate', name: 'Intermediate', color: 'text-blue-600 bg-blue-50' },
  { id: 'advanced', name: 'Advanced', color: 'text-orange-600 bg-orange-50' },
  { id: 'expert', name: 'Expert', color: 'text-red-600 bg-red-50' }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AdminCampaignManager() {
  // State management
  const [campaigns, setCampaigns] = useState<CampaignTemplate[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<CampaignTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState<CampaignTemplate | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Document upload
  const [uploadProgress, setUploadProgress] = useState<DocumentUploadProgress[]>([]);
  const [isProcessingDocuments, setIsProcessingDocuments] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // DATA LOADING AND MANAGEMENT
  // ============================================================================

  const loadCampaigns = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await adminCampaignService.getAllCampaigns();
      setCampaigns(data);
      setFilteredCampaigns(data);
    } catch (error) {
      logger.error('Failed to load campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  // Filter campaigns based on current filters
  useEffect(() => {
    let filtered = campaigns;

    // Status filter
    if (statusFilter === 'published') {
      filtered = filtered.filter(c => c.published);
    } else if (statusFilter === 'draft') {
      filtered = filtered.filter(c => !c.published);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.subtitle.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.theme.toLowerCase().includes(query)
      );
    }

    setFilteredCampaigns(filtered);
  }, [campaigns, statusFilter, categoryFilter, searchQuery]);

  // ============================================================================
  // CAMPAIGN CRUD OPERATIONS
  // ============================================================================

  const createNewCampaign = () => {
    const newCampaign: CampaignTemplate = {
      title: '',
      subtitle: '',
      description: '',
      category: 'crisis',
      difficulty: 'intermediate',
      duration: 45,
      playerCount: 1,
      aiDelegates: 6,
      theme: '',
      context: '',
      objectives: [''],
      scenarios: [''],
      keyIssues: [''],
      icon: 'alertTriangle',
      color: CAMPAIGN_ICONS.alertTriangle.color,
      bgGradient: CAMPAIGN_ICONS.alertTriangle.bgGradient,
      featured: false,
      new: true,
      published: false,
      documents: []
    };

    setEditForm(newCampaign);
    setIsCreating(true);
    setIsEditing(true);
  };

  const editCampaign = (campaign: CampaignTemplate) => {
    setEditForm({ ...campaign });
    setSelectedCampaign(campaign);
    setIsCreating(false);
    setIsEditing(true);
  };

  const saveCampaign = async () => {
    if (!editForm) return;

    try {
      let savedCampaign;
      if (isCreating) {
        savedCampaign = await adminCampaignService.createCampaign(editForm);
        toast.success('Campaign created successfully');
      } else {
        savedCampaign = await adminCampaignService.updateCampaign(editForm.id!, editForm);
        toast.success('Campaign updated successfully');
      }

      await loadCampaigns();
      setIsEditing(false);
      setIsCreating(false);
      setEditForm(null);
      setSelectedCampaign(savedCampaign);
    } catch (error) {
      logger.error('Failed to save campaign:', error);
      toast.error('Failed to save campaign');
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }

    try {
      await adminCampaignService.deleteCampaign(campaignId);
      toast.success('Campaign deleted successfully');
      await loadCampaigns();
      
      if (selectedCampaign?.id === campaignId) {
        setSelectedCampaign(null);
      }
    } catch (error) {
      logger.error('Failed to delete campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const togglePublished = async (campaign: CampaignTemplate) => {
    try {
      const updatedCampaign = { ...campaign, published: !campaign.published };
      await adminCampaignService.updateCampaign(campaign.id!, updatedCampaign);
      toast.success(`Campaign ${updatedCampaign.published ? 'published' : 'unpublished'} successfully`);
      await loadCampaigns();
    } catch (error) {
      logger.error('Failed to toggle campaign status:', error);
      toast.error('Failed to update campaign status');
    }
  };

  // ============================================================================
  // DOCUMENT UPLOAD AND PROCESSING
  // ============================================================================

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/csv'
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error(`File type ${file.type} is not supported`);
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large (max 10MB)`);
        return;
      }

      uploadAndProcessDocument(file);
    });

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadAndProcessDocument = async (file: File) => {
    const uploadId = Date.now().toString();
    
    // Add to upload progress
    const newUpload: DocumentUploadProgress = {
      file,
      progress: 0,
      status: 'uploading'
    };

    setUploadProgress(prev => [...prev, newUpload]);

    try {
      // Upload file
      const uploadedDocument = await adminCampaignService.uploadDocument(file, (progress) => {
        setUploadProgress(prev => 
          prev.map(upload => 
            upload.file === file 
              ? { ...upload, progress: progress * 0.7 } // 70% for upload
              : upload
          )
        );
      });

      // Update status to processing
      setUploadProgress(prev => 
        prev.map(upload => 
          upload.file === file 
            ? { ...upload, status: 'processing', progress: 70 }
            : upload
        )
      );

      // Process document with AI
      const analysis = await adminCampaignService.processDocumentWithAI(uploadedDocument.id);

      // Update progress to completed
      setUploadProgress(prev => 
        prev.map(upload => 
          upload.file === file 
            ? { ...upload, status: 'completed', progress: 100, analysis }
            : upload
        )
      );

      // Add document to current edit form
      if (editForm) {
        const document: CampaignDocument = {
          id: uploadedDocument.id,
          name: file.name,
          type: file.type,
          size: file.size,
          url: uploadedDocument.url,
          uploadedAt: new Date().toISOString(),
          processed: true,
          analysis
        };

        setEditForm(prev => ({
          ...prev!,
          documents: [...(prev!.documents || []), document]
        }));

        // Apply AI suggestions if available
        if (analysis) {
          applyAISuggestions(analysis);
        }
      }

      toast.success(`Document ${file.name} processed successfully`);

    } catch (error) {
      logger.error('Failed to process document:', error);
      toast.error(`Failed to process ${file.name}`);
      
      setUploadProgress(prev => 
        prev.map(upload => 
          upload.file === file 
            ? { ...upload, status: 'error', progress: 0 }
            : upload
        )
      );
    }
  };

  const applyAISuggestions = (analysis: any) => {
    if (!editForm || !analysis) return;

    const updatedForm = { ...editForm };

    // Enhance description if empty or short
    if (analysis.summary && (!updatedForm.description || updatedForm.description.length < 100)) {
      updatedForm.description = analysis.summary;
    }

    // Add suggested objectives
    if (analysis.keyPoints && analysis.keyPoints.length > 0) {
      const newObjectives = analysis.keyPoints.filter((point: string) => 
        !updatedForm.objectives.some(existing => 
          existing.toLowerCase().includes(point.toLowerCase()) || 
          point.toLowerCase().includes(existing.toLowerCase())
        )
      );
      updatedForm.objectives = [...updatedForm.objectives.filter(obj => obj.trim()), ...newObjectives];
    }

    // Add suggested scenarios
    if (analysis.suggestedScenarios && analysis.suggestedScenarios.length > 0) {
      const newScenarios = analysis.suggestedScenarios.filter((scenario: string) => 
        !updatedForm.scenarios.some(existing => 
          existing.toLowerCase().includes(scenario.toLowerCase()) || 
          scenario.toLowerCase().includes(existing.toLowerCase())
        )
      );
      updatedForm.scenarios = [...updatedForm.scenarios.filter(sc => sc.trim()), ...newScenarios];
    }

    // Add relevant topics as key issues
    if (analysis.relevantTopics && analysis.relevantTopics.length > 0) {
      const newIssues = analysis.relevantTopics.filter((topic: string) => 
        !updatedForm.keyIssues.some(existing => 
          existing.toLowerCase().includes(topic.toLowerCase()) || 
          topic.toLowerCase().includes(existing.toLowerCase())
        )
      );
      updatedForm.keyIssues = [...updatedForm.keyIssues.filter(issue => issue.trim()), ...newIssues];
    }

    setEditForm(updatedForm);
    toast.success('AI suggestions applied to campaign');
  };

  const removeDocument = (documentId: string) => {
    if (!editForm) return;

    setEditForm(prev => ({
      ...prev!,
      documents: prev!.documents?.filter(doc => doc.id !== documentId) || []
    }));
  };

  // ============================================================================
  // FORM HELPERS
  // ============================================================================

  const updateFormField = (field: keyof CampaignTemplate, value: any) => {
    if (!editForm) return;

    setEditForm(prev => ({
      ...prev!,
      [field]: value
    }));
  };

  const updateArrayField = (field: 'objectives' | 'scenarios' | 'keyIssues', index: number, value: string) => {
    if (!editForm) return;

    const newArray = [...editForm[field]];
    newArray[index] = value;
    updateFormField(field, newArray);
  };

  const addArrayItem = (field: 'objectives' | 'scenarios' | 'keyIssues') => {
    if (!editForm) return;

    const newArray = [...editForm[field], ''];
    updateFormField(field, newArray);
  };

  const removeArrayItem = (field: 'objectives' | 'scenarios' | 'keyIssues', index: number) => {
    if (!editForm) return;

    const newArray = editForm[field].filter((_, i) => i !== index);
    updateFormField(field, newArray);
  };

  const updateCampaignIcon = (iconKey: string) => {
    if (!editForm) return;

    const iconData = CAMPAIGN_ICONS[iconKey as keyof typeof CAMPAIGN_ICONS];
    setEditForm(prev => ({
      ...prev!,
      icon: iconKey,
      color: iconData.color,
      bgGradient: iconData.bgGradient
    }));
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderCampaignCard = (campaign: CampaignTemplate) => (
    <Card 
      key={campaign.id} 
      className={`cursor-pointer transition-all hover:shadow-lg ${
        selectedCampaign?.id === campaign.id ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => setSelectedCampaign(campaign)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-gray-100 rounded-lg ${CAMPAIGN_ICONS[campaign.icon as keyof typeof CAMPAIGN_ICONS]?.color || 'text-gray-600'}`}>
              {campaign.icon === 'leaf' && <Leaf className="w-5 h-5" />}
              {campaign.icon === 'heart' && <Heart className="w-5 h-5" />}
              {campaign.icon === 'shield' && <Shield className="w-5 h-5" />}
              {campaign.icon === 'briefcase' && <Briefcase className="w-5 h-5" />}
              {campaign.icon === 'alertTriangle' && <AlertTriangle className="w-5 h-5" />}
              {campaign.icon === 'globe' && <Globe className="w-5 h-5" />}
              {campaign.icon === 'users' && <Users className="w-5 h-5" />}
              {campaign.icon === 'target' && <Target className="w-5 h-5" />}
            </div>
            <div>
              <CardTitle className="text-base">{campaign.title}</CardTitle>
              <p className="text-sm text-gray-600">{campaign.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {campaign.featured && <Badge variant="outline">Featured</Badge>}
            {campaign.new && <Badge variant="secondary">New</Badge>}
            <Badge variant={campaign.published ? 'default' : 'outline'}>
              {campaign.published ? 'Published' : 'Draft'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-700 line-clamp-2">{campaign.description}</p>
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-500" />
              <span>{campaign.duration}min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-gray-500" />
              <span>{campaign.aiDelegates} AI</span>
            </div>
          </div>
          <Badge variant="outline" className={DIFFICULTIES.find(d => d.id === campaign.difficulty)?.color}>
            {campaign.difficulty.charAt(0).toUpperCase() + campaign.difficulty.slice(1)}
          </Badge>
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-gray-500">
            {campaign.updatedAt ? `Updated ${new Date(campaign.updatedAt).toLocaleDateString()}` : 'New'}
          </span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                editCampaign(campaign);
              }}
            >
              <Edit3 className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                togglePublished(campaign);
              }}
            >
              {campaign.published ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-600 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                deleteCampaign(campaign.id!);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderCampaignDetails = () => {
    if (!selectedCampaign) return null;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{selectedCampaign.title}</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={() => editCampaign(selectedCampaign)}
                variant="outline"
                size="sm"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={() => togglePublished(selectedCampaign)}
                variant="outline"
                size="sm"
              >
                {selectedCampaign.published ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {selectedCampaign.published ? 'Unpublish' : 'Publish'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Overview</h4>
            <p className="text-gray-700">{selectedCampaign.description}</p>
            <p className="text-gray-600 mt-2">{selectedCampaign.context}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Category</Label>
              <p className="text-sm text-gray-600">{selectedCampaign.category}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Difficulty</Label>
              <p className="text-sm text-gray-600">{selectedCampaign.difficulty}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Duration</Label>
              <p className="text-sm text-gray-600">{selectedCampaign.duration} minutes</p>
            </div>
            <div>
              <Label className="text-sm font-medium">AI Delegates</Label>
              <p className="text-sm text-gray-600">{selectedCampaign.aiDelegates}</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Objectives</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              {selectedCampaign.objectives.filter(obj => obj.trim()).map((objective, index) => (
                <li key={index}>{objective}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Scenarios</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              {selectedCampaign.scenarios.filter(sc => sc.trim()).map((scenario, index) => (
                <li key={index}>{scenario}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Key Issues</h4>
            <div className="flex flex-wrap gap-2">
              {selectedCampaign.keyIssues.filter(issue => issue.trim()).map((issue, index) => (
                <Badge key={index} variant="outline">{issue}</Badge>
              ))}
            </div>
          </div>

          {selectedCampaign.documents && selectedCampaign.documents.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Documents</h4>
              <div className="space-y-2">
                {selectedCampaign.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{doc.name}</span>
                      {doc.processed && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderEditForm = () => {
    if (!isEditing || !editForm) return null;

    return (
      <Dialog open={isEditing} onOpenChange={() => setIsEditing(false)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'Create New Campaign' : 'Edit Campaign'}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editForm.title}
                    onChange={(e) => updateFormField('title', e.target.value)}
                    placeholder="Campaign title"
                  />
                </div>
                <div>
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={editForm.subtitle}
                    onChange={(e) => updateFormField('subtitle', e.target.value)}
                    placeholder="Campaign subtitle"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => updateFormField('description', e.target.value)}
                  placeholder="Campaign description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="context">Context</Label>
                <Textarea
                  id="context"
                  value={editForm.context}
                  onChange={(e) => updateFormField('context', e.target.value)}
                  placeholder="Campaign context and background"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="theme">Theme</Label>
                <Input
                  id="theme"
                  value={editForm.theme}
                  onChange={(e) => updateFormField('theme', e.target.value)}
                  placeholder="Campaign theme"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={editForm.category} 
                    onValueChange={(value) => updateFormField('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select 
                    value={editForm.difficulty} 
                    onValueChange={(value) => updateFormField('difficulty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map((diff) => (
                        <SelectItem key={diff.id} value={diff.id}>{diff.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={editForm.duration}
                    onChange={(e) => updateFormField('duration', parseInt(e.target.value))}
                    min="15"
                    max="180"
                  />
                </div>
                <div>
                  <Label htmlFor="playerCount">Player Count</Label>
                  <Input
                    id="playerCount"
                    type="number"
                    value={editForm.playerCount}
                    onChange={(e) => updateFormField('playerCount', parseInt(e.target.value))}
                    min="1"
                    max="4"
                  />
                </div>
                <div>
                  <Label htmlFor="aiDelegates">AI Delegates</Label>
                  <Input
                    id="aiDelegates"
                    type="number"
                    value={editForm.aiDelegates}
                    onChange={(e) => updateFormField('aiDelegates', parseInt(e.target.value))}
                    min="3"
                    max="15"
                  />
                </div>
              </div>

              <div>
                <Label>Campaign Icon</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {Object.entries(CAMPAIGN_ICONS).map(([key, iconData]) => (
                    <Button
                      key={key}
                      variant={editForm.icon === key ? 'default' : 'outline'}
                      className="h-12"
                      onClick={() => updateCampaignIcon(key)}
                    >
                      <div className={iconData.color}>
                        {key === 'leaf' && <Leaf className="w-5 h-5" />}
                        {key === 'heart' && <Heart className="w-5 h-5" />}
                        {key === 'shield' && <Shield className="w-5 h-5" />}
                        {key === 'briefcase' && <Briefcase className="w-5 h-5" />}
                        {key === 'alertTriangle' && <AlertTriangle className="w-5 h-5" />}
                        {key === 'globe' && <Globe className="w-5 h-5" />}
                        {key === 'users' && <Users className="w-5 h-5" />}
                        {key === 'target' && <Target className="w-5 h-5" />}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div>
                <Label>Objectives</Label>
                <div className="space-y-2 mt-2">
                  {editForm.objectives.map((objective, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={objective}
                        onChange={(e) => updateArrayField('objectives', index, e.target.value)}
                        placeholder="Campaign objective"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('objectives', index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('objectives')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Objective
                  </Button>
                </div>
              </div>

              <div>
                <Label>Scenarios</Label>
                <div className="space-y-2 mt-2">
                  {editForm.scenarios.map((scenario, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={scenario}
                        onChange={(e) => updateArrayField('scenarios', index, e.target.value)}
                        placeholder="Potential scenario"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('scenarios', index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('scenarios')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Scenario
                  </Button>
                </div>
              </div>

              <div>
                <Label>Key Issues</Label>
                <div className="space-y-2 mt-2">
                  {editForm.keyIssues.map((issue, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={issue}
                        onChange={(e) => updateArrayField('keyIssues', index, e.target.value)}
                        placeholder="Key issue or topic"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('keyIssues', index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('keyIssues')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Key Issue
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div>
                <Label>Upload Documents</Label>
                <p className="text-sm text-gray-600 mb-4">
                  Upload documents to help AI build and enhance your campaign. Supported formats: PDF, DOC, DOCX, TXT, CSV (max 10MB each)
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Select Documents
                </Button>
              </div>

              {/* Upload Progress */}
              {uploadProgress.length > 0 && (
                <div className="space-y-2">
                  <Label>Upload Progress</Label>
                  {uploadProgress.map((upload, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{upload.file.name}</span>
                        <div className="flex items-center gap-2">
                          {upload.status === 'uploading' && <AlertCircle className="w-4 h-4 text-blue-500" />}
                          {upload.status === 'processing' && <Zap className="w-4 h-4 text-yellow-500" />}
                          {upload.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {upload.status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                          <span className="text-sm text-gray-600">{upload.status}</span>
                        </div>
                      </div>
                      <Progress value={upload.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              )}

              {/* Current Documents */}
              {editForm.documents && editForm.documents.length > 0 && (
                <div>
                  <Label>Campaign Documents</Label>
                  <div className="space-y-2 mt-2">
                    {editForm.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-gray-500">
                              {(doc.size / 1024 / 1024).toFixed(1)}MB • {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                          {doc.processed && <CheckCircle className="w-4 h-4 text-green-500" />}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(doc.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Analysis Results */}
              {editForm.aiAnalysis && (
                <div>
                  <Label>AI Document Analysis</Label>
                  <Card className="mt-2">
                    <CardContent className="pt-4">
                      {editForm.aiAnalysis.documentSummary && (
                        <div className="mb-4">
                          <h4 className="font-medium text-sm mb-2">Document Summary</h4>
                          <p className="text-sm text-gray-700">{editForm.aiAnalysis.documentSummary}</p>
                        </div>
                      )}
                      
                      {editForm.aiAnalysis.keyInsights && editForm.aiAnalysis.keyInsights.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-sm mb-2">Key Insights</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                            {editForm.aiAnalysis.keyInsights.map((insight, index) => (
                              <li key={index}>{insight}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Featured Campaign</Label>
                  <p className="text-sm text-gray-600">Display prominently in campaign list</p>
                </div>
                <Switch
                  checked={editForm.featured}
                  onCheckedChange={(checked) => updateFormField('featured', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>New Campaign</Label>
                  <p className="text-sm text-gray-600">Show "New" badge on campaign</p>
                </div>
                <Switch
                  checked={editForm.new}
                  onCheckedChange={(checked) => updateFormField('new', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Published</Label>
                  <p className="text-sm text-gray-600">Make campaign available to users</p>
                </div>
                <Switch
                  checked={editForm.published}
                  onCheckedChange={(checked) => updateFormField('published', checked)}
                />
              </div>

              <Separator />

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setIsCreating(false);
                    setEditForm(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={saveCampaign}>
                  <Save className="w-4 h-4 mr-2" />
                  {isCreating ? 'Create Campaign' : 'Save Changes'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Management</h2>
          <p className="text-gray-600">Create, edit, and manage Model UN campaigns</p>
        </div>
        <Button onClick={createNewCampaign}>
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Label>Search:</Label>
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Label>Status:</Label>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Label>Category:</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto text-sm text-gray-600">
              {filteredCampaigns.length} of {campaigns.length} campaigns
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign List */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No campaigns found</h3>
                <p className="text-gray-500 mb-4">
                  {campaigns.length === 0 
                    ? "Get started by creating your first campaign" 
                    : "Try adjusting your search filters"}
                </p>
                {campaigns.length === 0 && (
                  <Button onClick={createNewCampaign}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Campaign
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCampaigns.map(renderCampaignCard)}
            </div>
          )}
        </div>

        {/* Campaign Details */}
        <div>
          {selectedCampaign ? (
            renderCampaignDetails()
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-600 mb-2">Select a Campaign</h3>
                <p className="text-gray-500">Choose a campaign from the list to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Form Modal */}
      {renderEditForm()}
    </div>
  );
}

export default AdminCampaignManager;