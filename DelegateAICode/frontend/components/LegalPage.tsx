import { useState } from 'react';
import { ArrowLeft, FileText, Shield, Eye, Scale, Users, Globe, Mail, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from './AuthContext';

interface LegalPageProps {
  onBack: () => void;
}

export function LegalPage({ onBack }: LegalPageProps) {
  const { user } = useAuth();
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container-responsive py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="flex items-center gap-3">
              <Scale className="h-6 w-6 text-brand-blue" />
              Privacy
            </h1>
            <p className="text-muted-foreground mt-1">
              Updated {currentDate} • Version 1.0
            </p>
          </div>
        </div>

        <Tabs defaultValue="privacy" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="privacy" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="terms" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Terms</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Data Use</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Contact</span>
            </TabsTrigger>
          </TabsList>

          {/* Privacy Policy */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Privacy Policy
                </CardTitle>
                <CardDescription>
                  Your privacy is our priority. Here's how we protect and handle your data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Data Protection Summary</h4>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <li>• Your conversations are encrypted in transit and at rest</li>
                      <li>• Voice recordings are processed securely and not permanently stored</li>
                      <li>• Personal data is never sold or shared with third parties</li>
                      <li>• You can delete your data at any time from Settings</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Information We Collect</h4>
                  <div className="grid gap-3">
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium text-sm mb-1">Account Information</h5>
                      <p className="text-sm text-muted-foreground">Email address, display name, and preferences you provide</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium text-sm mb-1">Conversation Data</h5>
                      <p className="text-sm text-muted-foreground">Chat messages and voice transcriptions to provide AI responses</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">How We Use Your Data</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-brand-blue mt-1">•</span>
                      <span>Provide AI-powered conversation and voice responses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-blue mt-1">•</span>
                      <span>Maintain conversation history and transcripts for your reference</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-blue mt-1">•</span>
                      <span>Improve service quality and add new features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-blue mt-1">•</span>
                      <span>Ensure system security and prevent abuse</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Your Rights</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <h5 className="font-medium text-sm">Access & Export</h5>
                      <p className="text-xs text-muted-foreground mt-1">Download your conversation history anytime</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <h5 className="font-medium text-sm">Delete Account</h5>
                      <p className="text-xs text-muted-foreground mt-1">Permanently remove all your data</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <h5 className="font-medium text-sm">Data Portability</h5>
                      <p className="text-xs text-muted-foreground mt-1">Transfer your data to another service</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <h5 className="font-medium text-sm">Opt-Out</h5>
                      <p className="text-xs text-muted-foreground mt-1">Disable data collection features</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Terms of Service */}
          <TabsContent value="terms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Terms of Service
                </CardTitle>
                <CardDescription>
                  The rules and guidelines for using Delegate AI responsibly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Fair Use Summary</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Use Delegate AI for constructive dialogue and learning</li>
                    <li>• Respect others and avoid harmful or abusive content</li>
                    <li>• Don't attempt to circumvent safety measures</li>
                    <li>• Report issues and provide feedback to help us improve</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Acceptable Use</h4>
                  <div className="grid gap-3">
                    <div className="p-3 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/10 rounded-lg">
                      <h5 className="font-medium text-sm text-green-800 dark:text-green-200 mb-1">Encouraged Uses</h5>
                      <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                        <li>• Educational discussions and research</li>
                        <li>• Creative writing and brainstorming</li>
                        <li>• Professional communication practice</li>
                        <li>• Personal growth and reflection</li>
                      </ul>
                    </div>
                    <div className="p-3 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/10 rounded-lg">
                      <h5 className="font-medium text-sm text-red-800 dark:text-red-200 mb-1">Prohibited Uses</h5>
                      <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                        <li>• Harassment, abuse, or harmful content</li>
                        <li>• Illegal activities or copyright infringement</li>
                        <li>• Spreading misinformation or hate speech</li>
                        <li>• Attempting to extract training data</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Service Availability</h4>
                  <p className="text-sm text-muted-foreground">
                    We strive to provide reliable service but cannot guarantee 100% uptime. 
                    We may temporarily suspend service for maintenance, updates, or security reasons.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      Global Service
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      Multi-User Support
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Liability & Disclaimers</h4>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      <strong>Important:</strong> Delegate AI is an AI assistant designed for general conversation. 
                      Do not rely on it for medical, legal, or financial advice. Responses are generated by AI 
                      and may contain errors or biases.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Usage */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-600" />
                  Data Usage & AI Training
                </CardTitle>
                <CardDescription>
                  Transparency about how your data helps improve our AI services.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">AI Training & Improvement</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Your conversations may be used to improve our AI models, but only in anonymized, 
                    aggregated form. Personal identifiers are removed before any analysis.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Third-Party AI Services</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-sm">OpenAI (ChatGPT & Whisper)</h5>
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Powers our AI responses and voice transcription
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          OpenAI Privacy Policy
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Data Retention</h4>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h5 className="font-medium text-sm">Chat History</h5>
                        <p className="text-xs text-muted-foreground">Your conversation transcripts</p>
                      </div>
                      <Badge variant="outline">Indefinite*</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h5 className="font-medium text-sm">Voice Recordings</h5>
                        <p className="text-xs text-muted-foreground">Audio files from voice conversations</p>
                      </div>
                      <Badge variant="outline">24 Hours</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h5 className="font-medium text-sm">Account Data</h5>
                        <p className="text-xs text-muted-foreground">Profile and preferences</p>
                      </div>
                      <Badge variant="outline">Until Deleted</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    * You can delete your conversation history at any time from Settings → Data Management
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact */}
          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-green-600" />
                  Contact & Support
                </CardTitle>
                <CardDescription>
                  Get help, report issues, or provide feedback about Delegate AI.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">General Support</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      For technical issues, feature requests, or general questions
                    </p>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Mail className="h-4 w-4" />
                      support@delegate.ai
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Privacy & Legal</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Data requests, privacy concerns, or legal inquiries
                    </p>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Shield className="h-4 w-4" />
                      privacy@delegate.ai
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Security Issues</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Report security vulnerabilities or safety concerns
                    </p>
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileText className="h-4 w-4" />
                      security@delegate.ai
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Business Information</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Delegate AI</strong></p>
                    <p>AI-Powered Conversation Platform</p>
                    <p>Built with privacy and transparency in mind</p>
                  </div>
                </div>


              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-sm text-muted-foreground">
            Last updated: {currentDate} • These terms are effective immediately and apply to all users.
          </p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <Badge variant="outline" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              GDPR Compliant
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              Privacy by Design
            </Badge>
            <Badge variant="outline" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Terms v1.0
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}