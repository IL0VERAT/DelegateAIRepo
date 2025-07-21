/**
 * PRIVACY SETTINGS - CCPA RIGHTS MANAGEMENT INTERFACE
 * ==================================================
 * 
 * Comprehensive privacy settings interface that implements all CCPA rights
 * and provides users with full control over their personal information.
 */

import React, { useState, useEffect } from 'react';
import { usePrivacy } from './PrivacyContext';
import { privacyEmailService } from '../services/privacyEmailService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { 
  Shield, 
  Download, 
  Trash2, 
  Eye, 
  UserX, 
  Settings, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Lock, 
  Key, 
  FileText, 
  Clock, 
  Mail, 
  Phone, 
  HelpCircle,
  ExternalLink,
  Copy,
  RefreshCw,
  Archive,
  Bell,
  Globe,
  Database,
  Fingerprint
} from 'lucide-react';

export function PrivacySettings(): JSX.Element {
  const { 
    state, 
    requestToKnow, 
    requestToDelete, 
    optOutOfSale, 
    optInToSale, 
    limitSensitiveDataUse,
    exportPersonalData,
    updatePrivacySettings,
    submitPrivacyRequest,
    verifyUserIdentity,
    getPrivacyRightsInfo,
    checkCCPACompliance
  } = usePrivacy();

  const [activeTab, setActiveTab] = useState('rights');
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'phone' | 'security_questions'>('email');
  const [verificationData, setVerificationData] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [requestDetails, setRequestDetails] = useState('');
  const [isComplianceCheckOpen, setIsComplianceCheckOpen] = useState(false);

  const privacyRights = getPrivacyRightsInfo();

  // Check compliance on load
  useEffect(() => {
    checkCCPACompliance();
  }, [checkCCPACompliance]);

  const handleVerification = async () => {
    try {
      const verified = await verifyUserIdentity(verificationMethod, verificationData);
      if (verified) {
        setIsVerificationOpen(false);
        toast.success('Identity verified successfully.');
      }
    } catch (error) {
      toast.error('Verification failed. Please try again.');
    }
  };

  const handleExportData = async (format: 'json' | 'csv' | 'pdf') => {
    await exportPersonalData(format);
  };

  const handlePrivacySettingChange = async (key: string, value: any) => {
    await updatePrivacySettings({ [key]: value });
  };

  const dataCategories = [
    { id: 'identifiers', label: 'Identifiers (email, user ID)', description: 'Contact information and account identifiers' },
    { id: 'personal_records', label: 'Personal Records', description: 'Profile information and preferences' },
    { id: 'audio', label: 'Audio Data', description: 'Voice recordings and transcripts' },
    { id: 'internet_activity', label: 'Internet Activity', description: 'Usage patterns and interactions' },
    { id: 'geolocation', label: 'Location Data', description: 'Geographic location information' },
    { id: 'inferences', label: 'Inferences', description: 'Derived insights about preferences' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Privacy Rights & Settings</h1>
          {state.ccpa_compliant && (
            <Badge variant="outline" className="text-green-600 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              CCPA Compliant
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Manage your privacy preferences and exercise your rights under the California Consumer Privacy Act (CCPA).
        </p>
        
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertTitle>Need Help with Privacy Requests?</AlertTitle>
          <AlertDescription>
            If you have any questions about your privacy rights or need assistance with requests, 
            you can contact our privacy team directly at{' '}
            <a 
              href="mailto:privacy@delegate-ai.com" 
              className="font-medium underline hover:no-underline"
            >
              privacy@delegate-ai.com
            </a>
            . We're committed to responding to all privacy inquiries within 48 hours.
          </AlertDescription>
        </Alert>
      </div>

      {/* Compliance Status */}
      {!state.ccpa_compliant && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Compliance Notice</AlertTitle>
          <AlertDescription>
            Some privacy features are being updated to ensure full CCPA compliance. 
            <Button variant="link" className="p-0 h-auto ml-1" onClick={() => setIsComplianceCheckOpen(true)}>
              Learn more
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="rights">Your Rights</TabsTrigger>
          <TabsTrigger value="data">Your Data</TabsTrigger>
          <TabsTrigger value="consent">Consent</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Your Rights Tab */}
        <TabsContent value="rights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Right to Know
              </CardTitle>
              <CardDescription>
                {privacyRights.right_to_know.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select data categories (optional):</Label>
                <div className="grid grid-cols-2 gap-2">
                  {dataCategories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={category.id}
                        checked={selectedCategories.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, category.id]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={category.id} className="text-sm">
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button 
                onClick={() => requestToKnow(selectedCategories.length > 0 ? selectedCategories : undefined)}
                className="w-full"
              >
                Request Information About My Data
              </Button>
              
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  When you submit this request, an email notification will be automatically sent to our development team 
                  at <strong>privacy@delegate-ai.com</strong> You will also receive a confirmation email with your request details.
                </AlertDescription>
              </Alert>
              
              <p className="text-xs text-muted-foreground">
                Response time: {privacyRights.right_to_know.response_time}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Right to Delete
              </CardTitle>
              <CardDescription>
                {privacyRights.right_to_delete.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Deletion requests require identity verification. Some data may be retained for legal compliance.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label>Deletion details (optional):</Label>
                <Textarea
                  placeholder="Specify what data you'd like deleted or any special instructions..."
                  value={requestDetails}
                  onChange={(e) => setRequestDetails(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                {!state.user_verified && (
                  <Dialog open={isVerificationOpen} onOpenChange={setIsVerificationOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        <Key className="h-4 w-4 mr-2" />
                        Verify Identity
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Identity Verification</DialogTitle>
                        <DialogDescription>
                          We need to verify your identity before processing deletion requests.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Verification Method</Label>
                          <Select value={verificationMethod} onValueChange={(value: any) => setVerificationMethod(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email">Email Verification</SelectItem>
                              <SelectItem value="phone">Phone Verification</SelectItem>
                              <SelectItem value="security_questions">Security Questions</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>
                            {verificationMethod === 'email' && 'Email Address'}
                            {verificationMethod === 'phone' && 'Phone Number'}
                            {verificationMethod === 'security_questions' && 'Answer'}
                          </Label>
                          <Input
                            value={verificationData}
                            onChange={(e) => setVerificationData(e.target.value)}
                            placeholder={
                              verificationMethod === 'email' ? 'Enter your email address' :
                              verificationMethod === 'phone' ? 'Enter your phone number' :
                              'Answer security question'
                            }
                          />
                        </div>
                        <Button onClick={handleVerification} className="w-full">
                          Verify Identity
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                
                <Button 
                  onClick={() => requestToDelete(selectedCategories.length > 0 ? selectedCategories : undefined, requestDetails)}
                  disabled={!state.user_verified}
                  variant="destructive"
                  className="flex-1"
                >
                  Request Data Deletion
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Response time: {privacyRights.right_to_delete.response_time}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5" />
                Right to Opt-Out of Sale
              </CardTitle>
              <CardDescription>
                {privacyRights.right_to_opt_out.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Do Not Sell My Personal Information</Label>
                  <p className="text-sm text-muted-foreground">
                    Prevent the sale of your personal information to third parties
                  </p>
                </div>
                <Switch
                  checked={state.privacy_settings.opt_out_of_sale}
                  onCheckedChange={(checked: any) => {
                    if (checked) {
                      optOutOfSale();
                    } else {
                      optInToSale();
                    }
                  }}
                />
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This setting takes effect immediately. We do not currently sell personal information, 
                  but this ensures your choice is respected if our practices change.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Right to Limit Sensitive Data Use
              </CardTitle>
              <CardDescription>
                {privacyRights.right_to_limit_sensitive_data.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Limit Use of Sensitive Personal Information</Label>
                  <p className="text-sm text-muted-foreground">
                    Restrict how we use sensitive data like voice recordings
                  </p>
                </div>
                <Switch
                  checked={state.privacy_settings.limit_sensitive_data_use}
                  onCheckedChange={(checked) => limitSensitiveDataUse(checked)}
                />
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>Sensitive information includes:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Voice recordings and audio data</li>
                  <li>Precise geolocation data</li>
                  <li>Biometric identifiers</li>
                  <li>Personal information revealing racial or ethnic origin</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Your Data Tab */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Personal Information Inventory
              </CardTitle>
              <CardDescription>
                Overview of the personal information we have collected about you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {state.personal_information.map((info) => (
                <div key={info.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{info.category.replace('_', ' ').toUpperCase()}</h4>
                    {info.sensitive && (
                      <Badge variant="destructive" className="text-xs">
                        Sensitive
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{info.data}</p>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-medium">Source:</span> {info.source.replace('_', ' ')}
                    </div>
                    <div>
                      <span className="font-medium">Purpose:</span> {info.purpose.join(', ')}
                    </div>
                    <div>
                      <span className="font-medium">Collected:</span> {new Date(info.collected_date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Retention:</span> {info.retention_period}
                    </div>
                  </div>
                  {info.shared_with && info.shared_with.length > 0 && (
                    <div className="text-xs">
                      <span className="font-medium">Shared with:</span> {info.shared_with.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Data Export
              </CardTitle>
              <CardDescription>
                Download a copy of your personal information in your preferred format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleExportData('json')}
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  JSON
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleExportData('csv')}
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleExportData('pdf')}
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Exported data includes all personal information, privacy settings, and request history.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consent Tab */}
        <TabsContent value="consent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Consent Management
              </CardTitle>
              <CardDescription>
                Manage your consent for different types of data processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Data Collection</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow collection of data necessary for core service functionality
                    </p>
                  </div>
                  <Switch
                    checked={state.privacy_settings.data_collection_consent}
                    onCheckedChange={(checked) => handlePrivacySettingChange('data_collection_consent', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow us to analyze usage patterns to improve our services
                    </p>
                  </div>
                  <Switch
                    checked={state.privacy_settings.analytics_consent}
                    onCheckedChange={(checked) => handlePrivacySettingChange('analytics_consent', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Marketing Communications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional emails and product updates
                    </p>
                  </div>
                  <Switch
                    checked={state.privacy_settings.marketing_consent}
                    onCheckedChange={(checked) => handlePrivacySettingChange('marketing_consent', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Third-Party Sharing</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow sharing data with trusted partners for service improvement
                    </p>
                  </div>
                  <Switch
                    checked={state.privacy_settings.third_party_sharing_consent}
                    onCheckedChange={(checked) => handlePrivacySettingChange('third_party_sharing_consent', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Sensitive Data Processing</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow processing of sensitive information like voice recordings
                    </p>
                  </div>
                  <Switch
                    checked={state.privacy_settings.sensitive_data_processing_consent}
                    onCheckedChange={(checked) => handlePrivacySettingChange('sensitive_data_processing_consent', checked)}
                  />
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You can withdraw consent at any time. Some features may not work properly without certain consents.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Consent History
              </CardTitle>
              <CardDescription>
                View your consent history and withdrawal rights
              </CardDescription>
            </CardHeader>
            <CardContent>
              {state.consent_records.length > 0 ? (
                <div className="space-y-3">
                  {state.consent_records.map((consent) => (
                    <div key={consent.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{consent.purpose}</p>
                          <p className="text-sm text-muted-foreground">
                            {consent.granted ? 'Granted' : 'Withdrawn'} on {new Date(consent.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={consent.granted ? 'default' : 'secondary'}>
                          {consent.granted ? 'Active' : 'Withdrawn'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No consent records available.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Privacy Request History
              </CardTitle>
              <CardDescription>
                Track the status of your privacy rights requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {state.privacy_requests.length > 0 ? (
                <div className="space-y-3">
                  {state.privacy_requests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {request.type.charAt(0).toUpperCase() + request.type.slice(1)} Request
                        </h4>
                        <Badge 
                          variant={
                            request.status === 'completed' ? 'default' :
                            request.status === 'processing' ? 'secondary' :
                            request.status === 'denied' ? 'destructive' :
                            'outline'
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Requested: {new Date(request.requested_date).toLocaleDateString()}</p>
                        {request.completion_date && (
                          <p>Completed: {new Date(request.completion_date).toLocaleDateString()}</p>
                        )}
                        {request.details && <p>Details: {request.details}</p>}
                        {request.verification_method && (
                          <p>Verification: {request.verification_method}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No privacy requests submitted yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Submit New Request
              </CardTitle>
              <CardDescription>
                Submit additional privacy rights requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => submitPrivacyRequest('access', 'Request for data access')}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Eye className="h-5 w-5" />
                  <span className="text-sm">Data Access</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => submitPrivacyRequest('portability', 'Request for data portability')}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  <span className="text-sm">Data Portability</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Communication Preferences
              </CardTitle>
              <CardDescription>
                Control how we communicate with you about privacy matters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important privacy updates via email
                    </p>
                  </div>
                  <Switch
                    checked={state.privacy_settings.communication_preferences.email}
                    onCheckedChange={(checked) => 
                      handlePrivacySettingChange('communication_preferences', {
                        ...state.privacy_settings.communication_preferences,
                        email: checked
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Privacy Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about privacy policy changes
                    </p>
                  </div>
                  <Switch
                    checked={state.privacy_settings.communication_preferences.privacy_updates}
                    onCheckedChange={(checked) => 
                      handlePrivacySettingChange('communication_preferences', {
                        ...state.privacy_settings.communication_preferences,
                        privacy_updates: checked
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Data Retention Preferences
              </CardTitle>
              <CardDescription>
                Control how long we keep your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-delete after inactivity</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically delete data after extended inactivity
                  </p>
                </div>
                <Switch
                  checked={state.privacy_settings.data_retention_preferences.delete_after_inactivity}
                  onCheckedChange={(checked) => 
                    handlePrivacySettingChange('data_retention_preferences', {
                      ...state.privacy_settings.data_retention_preferences,
                      delete_after_inactivity: checked
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-delete transcripts</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically delete conversation transcripts
                  </p>
                </div>
                <Switch
                  checked={state.privacy_settings.data_retention_preferences.auto_delete_transcripts}
                  onCheckedChange={(checked) => 
                    handlePrivacySettingChange('data_retention_preferences', {
                      ...state.privacy_settings.data_retention_preferences,
                      auto_delete_transcripts: checked
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Rights Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Your Privacy Rights
              </CardTitle>
              <CardDescription>
                Learn more about your rights under CCPA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Non-Discrimination Policy</AlertTitle>
                <AlertDescription>
                  {privacyRights.non_discrimination.description} {privacyRights.non_discrimination.details}
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium">Contact Information</h4>
                  <p className="text-muted-foreground">
                    For privacy-related questions: privacy@delegateai.com<br />
                    Phone: 1-800-PRIVACY (1-800-774-8229)
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Response Times</h4>
                  <p className="text-muted-foreground">
                    Most requests are processed within 45 days as required by law.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compliance Check Dialog */}
      <Dialog open={isComplianceCheckOpen} onOpenChange={setIsComplianceCheckOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>CCPA Compliance Status</DialogTitle>
            <DialogDescription>
              Our commitment to protecting your privacy rights
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Right to Know</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Right to Delete</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Right to Opt-Out</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Data Portability</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Consent Management</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Privacy Policy</span>
              </div>
            </div>
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                All CCPA requirements are implemented and active. Your privacy rights are fully protected.
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PrivacySettings;