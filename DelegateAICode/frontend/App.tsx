/**
 * MAIN APP COMPONENT - UPDATED WITH AUTH PROVIDER
 * ==============================================
 * 
 * Root application component with authentication and subscription context
 */

import React from 'react';
import { AppProvider } from './components/AppContext';
import { AuthProvider } from './components/AuthContext';
import { PrivacyProvider } from './components/PrivacyContext';
import  ErrorBoundary  from './components/ErrorBoundary';
import { SidebarProvider } from './components/ui/sidebar';
import { AppSidebar } from './components/AppSidebar';
import { EnhancedConnectionStatus } from './components/EnhancedConnectionStatus';
import { CommunityAnnouncements } from './components/CommunityAnnouncements';
import { DynamicSEO } from './components/DynamicSEO';
import { Toaster } from './components/ui/sonner';

// Import page components
import { LoginPage } from './components/LoginPage';
import { ModelUNCampaigns } from './components/ModelUNCampaigns';
import { ChatInterface } from './components/ChatInterface';
import { VoiceInterface } from './components/VoiceInterface';
import { SettingsPage } from './components/SettingsPage';
import { HistoryPage } from './components/HistoryPage';
import { TranscriptsPage } from './components/TranscriptsPage';
import { HelpPage } from './components/HelpPage';
import { LegalPage } from './components/LegalPage';
import { AdminConsole } from './components/AdminConsole';
import { ComprehensiveGuide } from './components/ComprehensiveGuide';

import { useApp } from './components/AppContext';
import { useAuth } from './components/AuthContext';

// ============================================================================
// MAIN APP CONTENT COMPONENT
// ============================================================================

function AppContent() {
  const { currentView } = useApp();
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading Delegate AI...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <DynamicSEO 
          title="Login - Delegate AI" 
          description="Sign in to access your Model UN simulations"
        />
        <LoginPage />
      </div>
    );
  }

  // Main authenticated application
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Connection Status */}
          <EnhancedConnectionStatus />
          
          {/* Community Announcements */}
          <CommunityAnnouncements />
          
          {/* Main Content Area */}
          <div className="flex-1 overflow-auto">
            {currentView === 'campaigns' && (
              <>
                <DynamicSEO 
                  title="Model UN Campaigns - Delegate AI" 
                  description="Choose from a variety of Model UN simulation campaigns"
                />
                <ModelUNCampaigns />
              </>
            )}
            
            {currentView === 'chat' && (
              <>
                <DynamicSEO 
                  title="Chat Interface - Delegate AI" 
                  description="Engage in diplomatic negotiations through text"
                />
                <ChatInterface />
              </>
            )}
            
            {currentView === 'voice' && (
              <>
                <DynamicSEO 
                  title="Voice Interface - Delegate AI" 
                  description="Experience immersive voice-to-voice diplomatic negotiations"
                />
                <VoiceInterface />
              </>
            )}
            
            {currentView === 'settings' && (
              <>
                <DynamicSEO 
                  title="Settings - Delegate AI" 
                  description="Customize your Model UN simulation experience"
                />
                <SettingsPage />
              </>
            )}
            
            {currentView === 'history' && (
              <>
                <DynamicSEO 
                  title="Session History - Delegate AI" 
                  description="Review your past Model UN negotiations and performance"
                />
                <HistoryPage />
              </>
            )}
            
            {currentView === 'transcripts' && (
              <>
                <DynamicSEO 
                  title="Transcripts - Delegate AI" 
                  description="Access detailed transcripts of your diplomatic sessions"
                />
                <TranscriptsPage />
              </>
            )}
            
            {currentView === 'help' && (
              <>
                <DynamicSEO 
                  title="Help & Support - Delegate AI" 
                  description="Get help with Model UN simulations and platform features"
                />
                <HelpPage />
              </>
            )}
            
            {currentView === 'legal' && (
              <>
                <DynamicSEO 
                  title="Legal & Privacy - Delegate AI" 
                  description="Privacy policy, terms of service, and legal information"
                />
                <LegalPage onBack={function (): void {
                  throw new Error('Function not implemented.');
                } } />
              </>
            )}
            
            {currentView === 'guide' && (
              <>
                <DynamicSEO 
                  title="User Guide - Delegate AI" 
                  description="Comprehensive guide to mastering Model UN simulations"
                />
                <ComprehensiveGuide />
              </>
            )}
            
            {(currentView.startsWith('admin') || currentView === 'admin') && (
              <>
                <DynamicSEO 
                  title="Admin Console - Delegate AI" 
                  description="Administrative controls and system management"
                />
                <AdminConsole />
              </>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PrivacyProvider>
          <AppProvider>
            <AppContent />
            <Toaster position="top-right" />
          </AppProvider>
        </PrivacyProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;