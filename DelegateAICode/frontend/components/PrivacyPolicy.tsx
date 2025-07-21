/**
 * PRIVACY POLICY - CCPA COMPLIANT PRIVACY POLICY
 * ==============================================
 * 
 * Comprehensive privacy policy that meets all CCPA disclosure requirements
 * including detailed information about data collection, use, sharing, and user rights.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Shield, 
  Eye, 
  Trash2, 
  UserX, 
  Lock, 
  Globe, 
  Clock, 
  FileText, 
  Phone, 
  Mail, 
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  Info,
  AlertTriangle,
  Database,
  Share2,
  Settings
} from 'lucide-react';

interface PrivacyPolicyProps {
  onBack?: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps): JSX.Element {
  const [activeSection, setActiveSection] = useState('overview');

  const lastUpdated = new Date('2024-12-01');
  const effectiveDate = new Date('2024-12-01');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <Badge variant="outline" className="text-green-600 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              CCPA Compliant
            </Badge>
          </div>
          <div className="text-muted-foreground space-y-1">
            <p>Last Updated: {lastUpdated.toLocaleDateString()}</p>
            <p>Effective Date: {effectiveDate.toLocaleDateString()}</p>
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>California Residents</AlertTitle>
          <AlertDescription>
            This privacy policy includes specific disclosures required by the California Consumer Privacy Act (CCPA). 
            California residents have additional rights detailed in the "Your Privacy Rights" section.
          </AlertDescription>
        </Alert>
      </div>

      {/* Navigation */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="data-collection">Data Collection</TabsTrigger>
          <TabsTrigger value="your-rights">Your Rights</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Introduction</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none space-y-4">
              <p>
                Delegate AI ("we," "our," or "us") is committed to protecting your privacy and personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
                use our AI conversation platform and related services.
              </p>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Our Commitment</h3>
                <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-sm">
                  <li>• We collect only the information necessary to provide our services</li>
                  <li>• We never sell your personal information to third parties</li>
                  <li>• We implement industry-standard security measures</li>
                  <li>• We provide transparent, easy-to-understand privacy controls</li>
                  <li>• We fully comply with California Consumer Privacy Act (CCPA) requirements</li>
                </ul>
              </div>

              <h3 className="text-lg font-semibold">Scope of This Policy</h3>
              <p>
                This policy applies to all users of Delegate AI services, including:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Text-based AI conversations</li>
                <li>Voice interactions and recordings</li>
                <li>Model UN campaign simulations</li>
                <li>Account management and settings</li>
                <li>Website usage and analytics</li>
              </ul>

              <h3 className="text-lg font-semibold">Updates to This Policy</h3>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes 
                by posting the new Privacy Policy on this page and updating the "Last Updated" date. For significant 
                changes affecting your rights, we will provide additional notice through email or in-app notifications.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Personal Information Categories (CCPA Disclosure)
              </CardTitle>
              <CardDescription>
                The following table outlines the categories of personal information we collect, 
                as required by the California Consumer Privacy Act.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-gray-300 p-3 text-left">Category</th>
                      <th className="border border-gray-300 p-3 text-left">Examples</th>
                      <th className="border border-gray-300 p-3 text-left">Collected</th>
                      <th className="border border-gray-300 p-3 text-left">Sources</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">Identifiers</td>
                      <td className="border border-gray-300 p-3">Email address, username, user ID</td>
                      <td className="border border-gray-300 p-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </td>
                      <td className="border border-gray-300 p-3">Directly from you</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">Personal Records</td>
                      <td className="border border-gray-300 p-3">Profile preferences, settings</td>
                      <td className="border border-gray-300 p-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </td>
                      <td className="border border-gray-300 p-3">Directly from you</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">Internet Activity</td>
                      <td className="border border-gray-300 p-3">Usage patterns, feature interactions</td>
                      <td className="border border-gray-300 p-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </td>
                      <td className="border border-gray-300 p-3">Automatically collected</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">Audio Data</td>
                      <td className="border border-gray-300 p-3">Voice recordings, transcripts</td>
                      <td className="border border-gray-300 p-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </td>
                      <td className="border border-gray-300 p-3">Directly from you</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">Geolocation</td>
                      <td className="border border-gray-300 p-3">General location (country/state)</td>
                      <td className="border border-gray-300 p-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </td>
                      <td className="border border-gray-300 p-3">Automatically collected</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">Inferences</td>
                      <td className="border border-gray-300 p-3">Preferences, behavioral patterns</td>
                      <td className="border border-gray-300 p-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </td>
                      <td className="border border-gray-300 p-3">Derived from usage</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">Biometric</td>
                      <td className="border border-gray-300 p-3">Voice patterns (for recognition)</td>
                      <td className="border border-gray-300 p-3">❌</td>
                      <td className="border border-gray-300 p-3">N/A</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">Financial</td>
                      <td className="border border-gray-300 p-3">Payment information</td>
                      <td className="border border-gray-300 p-3">❌</td>
                      <td className="border border-gray-300 p-3">N/A</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Collection Tab */}
        <TabsContent value="data-collection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                How We Collect Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Information You Provide Directly</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <strong>Account Information:</strong> Email address, username, and password when you create an account
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <strong>Voice Data:</strong> Audio recordings when you use voice features, which are processed to provide AI responses
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <strong>Conversation Content:</strong> Text messages and voice transcripts from your interactions with the AI
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <strong>Settings and Preferences:</strong> Your choices for AI personality, voice settings, and privacy preferences
                    </div>
                  </li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Information We Collect Automatically</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <strong>Usage Information:</strong> How you interact with our services, features used, and session duration
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <strong>Device Information:</strong> Browser type, operating system, device type, and screen resolution
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <strong>Location Information:</strong> General geographic location (country/state level) based on IP address
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <strong>Performance Data:</strong> Error logs, response times, and system performance metrics
                    </div>
                  </li>
                </ul>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Data Minimization</AlertTitle>
                <AlertDescription>
                  We only collect information that is necessary to provide our services. We do not collect sensitive 
                  personal information such as financial data, health information, or precise geolocation data.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Business Purposes for Data Processing</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Service Provision</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Provide AI conversation services</li>
                      <li>• Process voice interactions</li>
                      <li>• Maintain conversation history</li>
                      <li>• Enable Model UN campaigns</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Account Management</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Create and maintain user accounts</li>
                      <li>• Authenticate users securely</li>
                      <li>• Apply user preferences</li>
                      <li>• Provide customer support</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Service Improvement</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Analyze usage patterns</li>
                      <li>• Improve AI responses</li>
                      <li>• Enhance user experience</li>
                      <li>• Develop new features</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Security & Legal</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Prevent fraud and abuse</li>
                      <li>• Ensure platform security</li>
                      <li>• Comply with legal obligations</li>
                      <li>• Protect user rights</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Legal Basis for Processing (International Users)</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <strong>Consent:</strong> For voice recordings, analytics, and marketing communications (where you have given explicit consent)
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <strong>Contract Performance:</strong> To provide the AI conversation services you've requested
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <strong>Legitimate Interests:</strong> For service improvement, security, and business operations
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-orange-600 mt-1 flex-shrink-0" />
                    <div>
                      <strong>Legal Compliance:</strong> To meet regulatory requirements and legal obligations
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Information Sharing and Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>We Do Not Sell Your Personal Information</AlertTitle>
                <AlertDescription>
                  Delegate AI does not sell, rent, or trade your personal information to third parties for monetary or other valuable consideration.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">When We May Share Information</h3>
                
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold">Service Providers</h4>
                    <p className="text-sm text-muted-foreground">
                      We may share information with trusted service providers who help us operate our services, 
                      such as cloud hosting providers and AI processing services. These providers are contractually 
                      bound to protect your information and use it only for the specified purposes.
                    </p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold">Legal Requirements</h4>
                    <p className="text-sm text-muted-foreground">
                      We may disclose information if required by law, legal process, or government request, 
                      or to protect the rights, property, or safety of Delegate AI, our users, or others.
                    </p>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold">Business Transfers</h4>
                    <p className="text-sm text-muted-foreground">
                      In the event of a merger, acquisition, or sale of assets, your information may be transferred 
                      as part of that transaction. We will notify you before your information is transferred and 
                      becomes subject to a different privacy policy.
                    </p>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold">Consent</h4>
                    <p className="text-sm text-muted-foreground">
                      We may share information with your explicit consent for specific purposes you have approved.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Third-Party Services</h3>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">AI Processing Services</h4>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-2">
                    We use Google's Gemini API for AI conversation processing. When you interact with our AI:
                  </p>
                  <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
                    <li>• Your messages are sent to Google's servers for processing</li>
                    <li>• Google processes the data according to their privacy policy</li>
                    <li>• We do not store your conversations on Google's servers beyond the session</li>
                    <li>• You can opt out of this processing by not using voice/AI features</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Data Retention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">How Long We Keep Your Information</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-gray-300 p-3 text-left">Data Type</th>
                        <th className="border border-gray-300 p-3 text-left">Retention Period</th>
                        <th className="border border-gray-300 p-3 text-left">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-3">Account Information</td>
                        <td className="border border-gray-300 p-3">Until account deletion + 30 days</td>
                        <td className="border border-gray-300 p-3">Account recovery, legal compliance</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Conversation Transcripts</td>
                        <td className="border border-gray-300 p-3">Until deleted by user or 2 years of inactivity</td>
                        <td className="border border-gray-300 p-3">User access, service improvement</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Voice Recordings</td>
                        <td className="border border-gray-300 p-3">Processed immediately, not stored</td>
                        <td className="border border-gray-300 p-3">Real-time processing only</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Usage Analytics</td>
                        <td className="border border-gray-300 p-3">6 months</td>
                        <td className="border border-gray-300 p-3">Service improvement, troubleshooting</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Security Logs</td>
                        <td className="border border-gray-300 p-3">1 year</td>
                        <td className="border border-gray-300 p-3">Security monitoring, compliance</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  You can request deletion of your data at any time through your privacy settings. 
                  Some information may be retained for legal compliance or security purposes as permitted by law.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Your Rights Tab */}
        <TabsContent value="your-rights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Your Privacy Rights Under CCPA
              </CardTitle>
              <CardDescription>
                California residents have specific rights regarding their personal information under the California Consumer Privacy Act.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-800 dark:text-blue-200">Right to Know</h3>
                    </div>
                    <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                      You have the right to know what personal information we collect, use, disclose, and sell about you.
                    </p>
                    <div className="text-blue-700 dark:text-blue-300 text-xs space-y-1">
                      <p><strong>What you can request:</strong></p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Categories of personal information collected</li>
                        <li>Sources of personal information</li>
                        <li>Business purposes for collecting information</li>
                        <li>Categories of third parties we share information with</li>
                        <li>Specific pieces of personal information collected</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg border-red-200 bg-red-50 dark:bg-red-950/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Trash2 className="h-5 w-5 text-red-600" />
                      <h3 className="font-semibold text-red-800 dark:text-red-200">Right to Delete</h3>
                    </div>
                    <p className="text-red-700 dark:text-red-300 text-sm mb-3">
                      You have the right to request deletion of your personal information, subject to certain exceptions.
                    </p>
                    <div className="text-red-700 dark:text-red-300 text-xs space-y-1">
                      <p><strong>Exceptions:</strong></p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Complete transactions and provide requested services</li>
                        <li>Comply with legal obligations</li>
                        <li>Exercise free speech or ensure another's free speech</li>
                        <li>Detect security incidents and protect against fraud</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg border-green-200 bg-green-50 dark:bg-green-950/20">
                    <div className="flex items-center gap-2 mb-2">
                      <UserX className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-green-800 dark:text-green-200">Right to Opt-Out</h3>
                    </div>
                    <p className="text-green-700 dark:text-green-300 text-sm mb-3">
                      You have the right to opt-out of the sale or sharing of your personal information.
                    </p>
                    <div className="text-green-700 dark:text-green-300 text-xs space-y-1">
                      <p><strong>Current status:</strong> We do not sell personal information</p>
                      <p><strong>How to opt-out:</strong> Use the toggle in your privacy settings</p>
                      <p><strong>Effect:</strong> Immediate and ongoing protection</p>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg border-purple-200 bg-purple-50 dark:bg-purple-950/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold text-purple-800 dark:text-purple-200">Right to Limit Sensitive Data</h3>
                    </div>
                    <p className="text-purple-700 dark:text-purple-300 text-sm mb-3">
                      You have the right to limit the use and disclosure of sensitive personal information.
                    </p>
                    <div className="text-purple-700 dark:text-purple-300 text-xs space-y-1">
                      <p><strong>Sensitive data includes:</strong></p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Voice recordings and audio data</li>
                        <li>Precise geolocation data</li>
                        <li>Personal information revealing protected characteristics</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">How to Exercise Your Rights</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <Settings className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h4 className="font-semibold mb-2">Privacy Settings</h4>
                    <p className="text-sm text-muted-foreground">
                      Access comprehensive privacy controls through your account settings
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg text-center">
                    <Mail className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-semibold mb-2">Email Request</h4>
                    <p className="text-sm text-muted-foreground">
                      Send privacy requests to privacy@delegateai.com
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg text-center">
                    <Phone className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <h4 className="font-semibold mb-2">Phone Support</h4>
                    <p className="text-sm text-muted-foreground">
                      Call 1-800-PRIVACY (1-800-774-8229)
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Non-Discrimination Policy</AlertTitle>
                <AlertDescription>
                  We will not discriminate against you for exercising your privacy rights. You will receive equal 
                  service quality regardless of whether you exercise your CCPA rights.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Response Timeline</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm">Standard Requests</h4>
                    <p className="text-muted-foreground text-sm">45 days from receipt</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm">Complex Requests</h4>
                    <p className="text-muted-foreground text-sm">90 days (with notice)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Verification Process</h3>
                <p className="text-muted-foreground text-sm">
                  To protect your privacy and security, we may need to verify your identity before processing certain requests. 
                  This may involve confirming your email address, answering security questions, or providing additional identification.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                International Users
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Rights for International Users</h3>
                <p className="text-muted-foreground">
                  While this privacy policy is designed to comply with CCPA requirements, we extend similar rights to all users regardless of location:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">GDPR Rights (EU Users)</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Right of access to personal data</li>
                      <li>• Right to rectification</li>
                      <li>• Right to erasure ("right to be forgotten")</li>
                      <li>• Right to restrict processing</li>
                      <li>• Right to data portability</li>
                      <li>• Right to object to processing</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Global Standards</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Transparent data processing</li>
                      <li>• Data minimization principles</li>
                      <li>• Purpose limitation</li>
                      <li>• Security by design</li>
                      <li>• User control and consent</li>
                      <li>• Regular privacy audits</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>
                How to reach us with privacy questions, concerns, or requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Privacy Officer</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Email:</strong> privacy@delegateai.com</p>
                      <p><strong>Phone:</strong> 1-800-PRIVACY (1-800-774-8229)</p>
                      <p><strong>Response Time:</strong> Within 2 business days</p>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">General Support</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Email:</strong> support@delegateai.com</p>
                      <p><strong>Hours:</strong> Monday-Friday, 9 AM - 6 PM PST</p>
                      <p><strong>Languages:</strong> English, Spanish, French</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Mailing Address</h3>
                    <div className="space-y-1 text-sm">
                      <p>Delegate AI Privacy Team</p>
                      <p>123 AI Innovation Drive</p>
                      <p>San Francisco, CA 94105</p>
                      <p>United States</p>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">EU Representative</h3>
                    <div className="space-y-1 text-sm">
                      <p>Delegate AI EU Privacy</p>
                      <p>456 European Privacy Blvd</p>
                      <p>Dublin, Ireland</p>
                      <p><strong>Email:</strong> eu-privacy@delegateai.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Privacy Request Form</h3>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-3">
                    For formal privacy requests, please include the following information:
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Your full name and email address associated with your account</li>
                    <li>• Type of request (Know, Delete, Opt-Out, Limit, Access, Portability)</li>
                    <li>• Specific information or categories you're requesting</li>
                    <li>• Preferred method of identity verification</li>
                    <li>• Any additional details or special instructions</li>
                  </ul>
                </div>
              </div>

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertTitle>Response Timeline</AlertTitle>
                <AlertDescription>
                  We will acknowledge your privacy request within 10 days and provide a substantive response 
                  within 45 days (or 90 days for complex requests with advance notice).
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Regulatory Agencies
              </CardTitle>
              <CardDescription>
                Contact information for relevant privacy regulatory agencies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">California Attorney General</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Website:</strong> oag.ca.gov/privacy/ccpa</p>
                    <p><strong>Email:</strong> privacy@doj.ca.gov</p>
                    <p><strong>Phone:</strong> (916) 210-6276</p>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">EU Data Protection</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Website:</strong> edpb.europa.eu</p>
                    <p><strong>Ireland DPC:</strong> dataprotection.ie</p>
                    <p><strong>Email:</strong> info@dataprotection.ie</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                You have the right to file a complaint with these regulatory agencies if you believe 
                your privacy rights have been violated.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center pt-6 border-t space-y-2">
        <p className="text-sm text-muted-foreground">
          This privacy policy is effective as of {effectiveDate.toLocaleDateString()} and was last updated on {lastUpdated.toLocaleDateString()}.
        </p>
        <p className="text-sm text-muted-foreground">
          For questions about this privacy policy, please contact us at privacy@delegateai.com
        </p>
      </div>
    </div>
  );
}

export default PrivacyPolicy;