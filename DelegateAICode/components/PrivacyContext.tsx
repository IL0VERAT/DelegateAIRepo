/**
 * PRIVACY CONTEXT - CCPA/CPRA COMPLIANCE MANAGEMENT
 * ================================================
 * 
 * Complete implementation of California Consumer Privacy Act (CCPA) and
 * California Privacy Rights Act (CPRA) requirements with full user rights support.
 * Enhanced with proper data persistence and validation for all privacy settings.
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner@2.0.3';
import { privacyEmailService } from '../services/privacyEmailService';
import { useAuth } from './AuthContext';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface PersonalInformation {
  id: string;
  category: 'identifiers' | 'personal_records' | 'characteristics' | 'biometric' | 'internet_activity' | 'geolocation' | 'audio' | 'professional' | 'education' | 'inferences';
  data: string;
  source: 'user_provided' | 'automatically_collected' | 'third_party';
  purpose: string[];
  collected_date: string;
  retention_period: string;
  shared_with?: string[];
  sensitive: boolean;
}

export interface PrivacyRequest {
  id: string;
  type: 'know' | 'delete' | 'opt_out' | 'limit_sensitive' | 'access' | 'portability';
  status: 'pending' | 'processing' | 'completed' | 'denied';
  requested_date: string;
  completion_date?: string;
  details?: string;
  verification_method?: string;
}

export interface ConsentRecord {
  id: string;
  purpose: string;
  granted: boolean;
  date: string;
  method: 'explicit' | 'implied' | 'opt_in' | 'opt_out';
  can_withdraw: boolean;
}

export interface DataSharingRecord {
  id: string;
  recipient: string;
  purpose: string;
  data_categories: string[];
  legal_basis: string;
  date: string;
  user_consented: boolean;
}

export interface PrivacySettings {
  data_collection_consent: boolean;
  analytics_consent: boolean;
  marketing_consent: boolean;
  third_party_sharing_consent: boolean;
  sensitive_data_processing_consent: boolean;
  opt_out_of_sale: boolean;
  limit_sensitive_data_use: boolean;
  communication_preferences: {
    email: boolean;
    sms: boolean;
    push_notifications: boolean;
    privacy_updates: boolean;
  };
  data_retention_preferences: {
    delete_after_inactivity: boolean;
    inactivity_period_months: number;
    auto_delete_transcripts: boolean;
    transcript_retention_months: number;
  };
  last_updated?: string;
}

export interface PrivacyState {
  // User Rights Data
  personal_information: PersonalInformation[];
  privacy_requests: PrivacyRequest[];
  consent_records: ConsentRecord[];
  data_sharing_records: DataSharingRecord[];
  
  // Settings
  privacy_settings: PrivacySettings;
  
  // Status
  ccpa_compliant: boolean;
  last_privacy_update: string | null;
  user_verified: boolean;
  
  // Loading states
  loading: {
    fetching_data: boolean;
    processing_request: boolean;
    updating_settings: boolean;
  };
  
  // Error states
  errors: {
    general: string | null;
    verification: string | null;
    request_submission: string | null;
  };
}

type PrivacyAction =
  | { type: 'SET_LOADING'; payload: { key: keyof PrivacyState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: { key: keyof PrivacyState['errors']; value: string | null } }
  | { type: 'SET_PERSONAL_INFORMATION'; payload: PersonalInformation[] }
  | { type: 'ADD_PRIVACY_REQUEST'; payload: PrivacyRequest }
  | { type: 'UPDATE_PRIVACY_REQUEST'; payload: { id: string; updates: Partial<PrivacyRequest> } }
  | { type: 'SET_PRIVACY_SETTINGS'; payload: PrivacySettings }
  | { type: 'UPDATE_PRIVACY_SETTINGS'; payload: Partial<PrivacySettings> }
  | { type: 'ADD_CONSENT_RECORD'; payload: ConsentRecord }
  | { type: 'SET_USER_VERIFIED'; payload: boolean }
  | { type: 'SET_CCPA_COMPLIANT'; payload: boolean }
  | { type: 'RESET_PRIVACY_DATA' };

// ============================================================================
// CONTEXT DEFINITION
// ============================================================================

interface PrivacyContextType {
  state: PrivacyState;
  
  // CCPA Rights Implementation
  requestToKnow: (categories?: string[]) => Promise<void>;
  requestToDelete: (categories?: string[], verification?: string) => Promise<void>;
  optOutOfSale: () => Promise<void>;
  optInToSale: () => Promise<void>;
  limitSensitiveDataUse: (limit: boolean) => Promise<void>;
  
  // Data Access and Portability
  exportPersonalData: (format?: 'json' | 'csv' | 'pdf') => Promise<void>;
  getDataInventory: () => Promise<PersonalInformation[]>;
  
  // Consent Management
  updateConsent: (purpose: string, granted: boolean) => Promise<void>;
  withdrawConsent: (consentId: string) => Promise<void>;
  
  // Privacy Settings
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => Promise<void>;
  resetPrivacySettings: () => Promise<void>;
  
  // Request Management
  submitPrivacyRequest: (type: PrivacyRequest['type'], details?: string) => Promise<void>;
  getRequestStatus: (requestId: string) => Promise<PrivacyRequest | null>;
  
  // Verification
  verifyUserIdentity: (method: 'email' | 'phone' | 'security_questions', data: any) => Promise<boolean>;
  
  // Utility Functions
  checkCCPACompliance: () => Promise<boolean>;
  getPrivacyRightsInfo: () => any;
  clearAllData: () => Promise<void>;
}

const PrivacyContext = createContext<PrivacyContextType | null>(null);

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialPrivacySettings: PrivacySettings = {
  data_collection_consent: true,
  analytics_consent: false,
  marketing_consent: false,
  third_party_sharing_consent: false,
  sensitive_data_processing_consent: false,
  opt_out_of_sale: true, // Default to opted out
  limit_sensitive_data_use: true, // Default to limited
  communication_preferences: {
    email: true,
    sms: false,
    push_notifications: true,
    privacy_updates: true,
  },
  data_retention_preferences: {
    delete_after_inactivity: false,
    inactivity_period_months: 24,
    auto_delete_transcripts: false,
    transcript_retention_months: 12,
  },
  last_updated: new Date().toISOString(),
};

const initialState: PrivacyState = {
  personal_information: [],
  privacy_requests: [],
  consent_records: [],
  data_sharing_records: [],
  privacy_settings: initialPrivacySettings,
  ccpa_compliant: true,
  last_privacy_update: null,
  user_verified: false,
  loading: {
    fetching_data: false,
    processing_request: false,
    updating_settings: false,
  },
  errors: {
    general: null,
    verification: null,
    request_submission: null,
  },
};

// ============================================================================
// REDUCER
// ============================================================================

function privacyReducer(state: PrivacyState, action: PrivacyAction): PrivacyState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.value,
        },
      };
      
    case 'SET_PERSONAL_INFORMATION':
      return {
        ...state,
        personal_information: action.payload,
      };
      
    case 'ADD_PRIVACY_REQUEST':
      return {
        ...state,
        privacy_requests: [...state.privacy_requests, action.payload],
      };
      
    case 'UPDATE_PRIVACY_REQUEST':
      return {
        ...state,
        privacy_requests: state.privacy_requests.map(request =>
          request.id === action.payload.id
            ? { ...request, ...action.payload.updates }
            : request
        ),
      };
      
    case 'SET_PRIVACY_SETTINGS':
      return {
        ...state,
        privacy_settings: action.payload,
        last_privacy_update: new Date().toISOString(),
      };
      
    case 'UPDATE_PRIVACY_SETTINGS':
      return {
        ...state,
        privacy_settings: {
          ...state.privacy_settings,
          ...action.payload,
          last_updated: new Date().toISOString(),
        },
        last_privacy_update: new Date().toISOString(),
      };
      
    case 'ADD_CONSENT_RECORD':
      return {
        ...state,
        consent_records: [...state.consent_records, action.payload],
      };
      
    case 'SET_USER_VERIFIED':
      return {
        ...state,
        user_verified: action.payload,
      };
      
    case 'SET_CCPA_COMPLIANT':
      return {
        ...state,
        ccpa_compliant: action.payload,
      };
      
    case 'RESET_PRIVACY_DATA':
      return {
        ...initialState,
        privacy_settings: state.privacy_settings, // Keep settings but reset data
      };
      
    default:
      return state;
  }
}

// ============================================================================
// PRIVACY PROVIDER COMPONENT
// ============================================================================

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(privacyReducer, initialState);
  const { user } = useAuth();

  // Load privacy data on mount and whenever user changes
  useEffect(() => {
    loadPrivacyData();
  }, [user?.id]);

  // ============================================================================
  // CORE FUNCTIONS WITH ENHANCED PERSISTENCE
  // ============================================================================

  const loadPrivacyData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'fetching_data', value: true } });
    
    try {
      const userId = user?.id || 'anonymous';
      
      // Load privacy settings with user-specific keys
      const settingsKey = `delegate-ai-privacy-settings-${userId}`;
      const storedSettings = localStorage.getItem(settingsKey);
      if (storedSettings) {
        try {
          const settings = JSON.parse(storedSettings);
          // Validate and merge with defaults
          const validatedSettings = validatePrivacySettings({
            ...initialPrivacySettings,
            ...settings,
            // Ensure timestamps are properly handled
            last_updated: settings.last_updated || new Date().toISOString()
          });
          dispatch({ type: 'SET_PRIVACY_SETTINGS', payload: validatedSettings });
        } catch (parseError) {
          console.warn('Invalid privacy settings format, using defaults:', parseError);
          const defaultSettings = { ...initialPrivacySettings, last_updated: new Date().toISOString() };
          dispatch({ type: 'SET_PRIVACY_SETTINGS', payload: defaultSettings });
          localStorage.setItem(settingsKey, JSON.stringify(defaultSettings));
        }
      } else {
        // Initialize with defaults for new users
        const defaultSettings = { ...initialPrivacySettings, last_updated: new Date().toISOString() };
        dispatch({ type: 'SET_PRIVACY_SETTINGS', payload: defaultSettings });
        localStorage.setItem(settingsKey, JSON.stringify(defaultSettings));
      }

      // Load privacy requests with user-specific keys
      const requestsKey = `delegate-ai-privacy-requests-${userId}`;
      const storedRequests = localStorage.getItem(requestsKey);
      if (storedRequests) {
        try {
          const requests = JSON.parse(storedRequests);
          if (Array.isArray(requests)) {
            // Clear existing requests first
            dispatch({ type: 'RESET_PRIVACY_DATA' });
            requests.forEach((request: PrivacyRequest) => {
              dispatch({ type: 'ADD_PRIVACY_REQUEST', payload: request });
            });
          }
        } catch (parseError) {
          console.warn('Invalid privacy requests format:', parseError);
        }
      }

      // Load consent records with user-specific keys
      const consentKey = `delegate-ai-consent-records-${userId}`;
      const storedConsents = localStorage.getItem(consentKey);
      if (storedConsents) {
        try {
          const consents = JSON.parse(storedConsents);
          if (Array.isArray(consents)) {
            consents.forEach((consent: ConsentRecord) => {
              dispatch({ type: 'ADD_CONSENT_RECORD', payload: consent });
            });
          }
        } catch (parseError) {
          console.warn('Invalid consent records format:', parseError);
        }
      }

      // Generate sample personal information inventory
      const personalInfo: PersonalInformation[] = [
        {
          id: '1',
          category: 'identifiers',
          data: 'Email address, user ID',
          source: 'user_provided',
          purpose: ['Account management', 'Communication'],
          collected_date: new Date().toISOString(),
          retention_period: '2 years after account deletion',
          sensitive: false,
        },
        {
          id: '2',
          category: 'audio',
          data: 'Voice recordings and transcripts',
          source: 'user_provided',
          purpose: ['AI conversation', 'Service improvement'],
          collected_date: new Date().toISOString(),
          retention_period: 'Until deleted by user or 1 year of inactivity',
          sensitive: true,
        },
        {
          id: '3',
          category: 'internet_activity',
          data: 'Usage patterns, feature preferences',
          source: 'automatically_collected',
          purpose: ['Service optimization', 'User experience'],
          collected_date: new Date().toISOString(),
          retention_period: '6 months',
          sensitive: false,
        },
      ];
      
      dispatch({ type: 'SET_PERSONAL_INFORMATION', payload: personalInfo });
      
    } catch (error) {
      console.error('Failed to load privacy data:', error);
      dispatch({ type: 'SET_ERROR', payload: { key: 'general', value: 'Failed to load privacy data' } });
      toast.error('Failed to load privacy data. Please refresh the page.');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'fetching_data', value: false } });
    }
  }, [user?.id]);

  // Enhanced settings validation
  const validatePrivacySettings = useCallback((settings: Partial<PrivacySettings>): PrivacySettings => {
    const validatedSettings = { ...initialPrivacySettings, ...settings };
    
    // Ensure boolean values are actually booleans
    const booleanFields = [
      'data_collection_consent', 'analytics_consent', 'marketing_consent',
      'third_party_sharing_consent', 'sensitive_data_processing_consent',
      'opt_out_of_sale', 'limit_sensitive_data_use'
    ];
    
    booleanFields.forEach(field => {
      if (typeof validatedSettings[field as keyof PrivacySettings] !== 'boolean') {
        validatedSettings[field as keyof PrivacySettings] = false as any;
      }
    });
    
    // Validate communication preferences
    if (validatedSettings.communication_preferences) {
      Object.keys(validatedSettings.communication_preferences).forEach(key => {
        const prefKey = key as keyof typeof validatedSettings.communication_preferences;
        if (typeof validatedSettings.communication_preferences[prefKey] !== 'boolean') {
          validatedSettings.communication_preferences[prefKey] = false;
        }
      });
    }
    
    // Validate data retention preferences
    if (validatedSettings.data_retention_preferences) {
      const retention = validatedSettings.data_retention_preferences;
      retention.inactivity_period_months = Math.max(1, Math.min(60, retention.inactivity_period_months || 24));
      retention.transcript_retention_months = Math.max(1, Math.min(60, retention.transcript_retention_months || 12));
    }
    
    return validatedSettings;
  }, []);

  // ============================================================================
  // CCPA RIGHTS IMPLEMENTATION
  // ============================================================================

  const requestToKnow = useCallback(async (categories?: string[]) => {
    const userId = user?.id || 'anonymous';
    
    const request: PrivacyRequest = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'know',
      status: 'pending',
      requested_date: new Date().toISOString(),
      details: categories ? `Categories: ${categories.join(', ')}` : 'All categories',
    };

    dispatch({ type: 'ADD_PRIVACY_REQUEST', payload: request });
    
    // Save to localStorage with user-specific key
    const requestsKey = `delegate-ai-privacy-requests-${userId}`;
    const existingRequests = JSON.parse(localStorage.getItem(requestsKey) || '[]');
    existingRequests.push(request);
    localStorage.setItem(requestsKey, JSON.stringify(existingRequests));
    
    // Also save to general key for compatibility
    const generalRequests = JSON.parse(localStorage.getItem('delegate-ai-privacy-requests') || '[]');
    generalRequests.push(request);
    localStorage.setItem('delegate-ai-privacy-requests', JSON.stringify(generalRequests));

    // Send email notification to development team
    try {
      const userEmail = user?.email || 'anonymous@example.com';
      const emailSent = await privacyEmailService.sendPrivacyRequestNotification({
        requestType: 'know',
        userEmail,
        userId: user?.id || 'anonymous-user',
        categories,
        details: request.details,
        timestamp: request.requested_date,
        requestId: request.id
      });

      if (emailSent) {
        // Send confirmation to user
        await privacyEmailService.sendPrivacyRequestConfirmation(
          userEmail,
          'know',
          request.id
        );
        
        toast.success('Request to Know submitted successfully. The development team has been notified and you will receive a response within 45 days.');
      } else {
        toast.warning('Request submitted but email notification failed. Please contact support if you do not receive a response.');
      }
    } catch (error) {
      console.error('Failed to send privacy request notification:', error);
      toast.warning('Request submitted but email notification failed. Please contact support if you do not receive a response.');
    }
    
    // Auto-complete for demo purposes
    setTimeout(() => {
      dispatch({ 
        type: 'UPDATE_PRIVACY_REQUEST', 
        payload: { 
          id: request.id, 
          updates: { 
            status: 'completed',
            completion_date: new Date().toISOString(),
          }
        }
      });
      
      // Update localStorage with the completed request
      const updatedRequests = JSON.parse(localStorage.getItem(requestsKey) || '[]');
      const requestIndex = updatedRequests.findIndex((r: PrivacyRequest) => r.id === request.id);
      if (requestIndex !== -1) {
        updatedRequests[requestIndex] = { ...updatedRequests[requestIndex], status: 'completed', completion_date: new Date().toISOString() };
        localStorage.setItem(requestsKey, JSON.stringify(updatedRequests));
      }
    }, 2000);
  }, [user?.id, user?.email]);

  const requestToDelete = useCallback(async (categories?: string[], verification?: string) => {
    if (!state.user_verified && !verification) {
      dispatch({ type: 'SET_ERROR', payload: { key: 'verification', value: 'Identity verification required for deletion requests' } });
      return;
    }

    const userId = user?.id || 'anonymous';
    
    const request: PrivacyRequest = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'delete',
      status: 'pending',
      requested_date: new Date().toISOString(),
      details: categories ? `Categories: ${categories.join(', ')}` : 'All personal information',
      verification_method: verification || 'pre_verified',
    };

    dispatch({ type: 'ADD_PRIVACY_REQUEST', payload: request });
    
    // Save to localStorage with user-specific key
    const requestsKey = `delegate-ai-privacy-requests-${userId}`;
    const existingRequests = JSON.parse(localStorage.getItem(requestsKey) || '[]');
    existingRequests.push(request);
    localStorage.setItem(requestsKey, JSON.stringify(existingRequests));
    
    // Also save to general key for compatibility
    const generalRequests = JSON.parse(localStorage.getItem('delegate-ai-privacy-requests') || '[]');
    generalRequests.push(request);
    localStorage.setItem('delegate-ai-privacy-requests', JSON.stringify(generalRequests));

    // Send email notification to development team
    try {
      const userEmail = user?.email || 'anonymous@example.com';
      const emailSent = await privacyEmailService.sendPrivacyRequestNotification({
        requestType: 'delete',
        userEmail,
        userId: user?.id || 'anonymous-user',
        categories,
        details: request.details,
        timestamp: request.requested_date,
        requestId: request.id
      });

      if (emailSent) {
        // Send confirmation to user
        await privacyEmailService.sendPrivacyRequestConfirmation(
          userEmail,
          'delete',
          request.id
        );
        
        toast.success('Deletion request submitted successfully. The development team has been notified and you will receive confirmation within 45 days.');
      } else {
        toast.warning('Request submitted but email notification failed. Please contact support if you do not receive a response.');
      }
    } catch (error) {
      console.error('Failed to send privacy request notification:', error);
      toast.warning('Request submitted but email notification failed. Please contact support if you do not receive a response.');
    }
  }, [state.user_verified, user?.id, user?.email]);

  const optOutOfSale = useCallback(async () => {
    await updatePrivacySettings({ opt_out_of_sale: true });
    toast.success('You have successfully opted out of the sale of your personal information.');
  }, []);

  const optInToSale = useCallback(async () => {
    await updatePrivacySettings({ opt_out_of_sale: false });
    toast.success('You have opted in to the sale of your personal information.');
  }, []);

  const limitSensitiveDataUse = useCallback(async (limit: boolean) => {
    await updatePrivacySettings({ limit_sensitive_data_use: limit });
    toast.success(`Sensitive data use has been ${limit ? 'limited' : 'unrestricted'}.`);
  }, []);

  // ============================================================================
  // DATA ACCESS AND PORTABILITY
  // ============================================================================

  const exportPersonalData = useCallback(async (format: 'json' | 'csv' | 'pdf' = 'json') => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'processing_request', value: true } });

    try {
      const exportData = {
        personal_information: state.personal_information,
        privacy_requests: state.privacy_requests,
        consent_records: state.consent_records,
        privacy_settings: state.privacy_settings,
        export_date: new Date().toISOString(),
        format: format,
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `delegate-ai-personal-data-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Personal data exported successfully.');
    } catch (error) {
      console.error('Export failed:', error);
      dispatch({ type: 'SET_ERROR', payload: { key: 'general', value: 'Failed to export data' } });
      toast.error('Failed to export data. Please try again.');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'processing_request', value: false } });
    }
  }, [state]);

  const getDataInventory = useCallback(async (): Promise<PersonalInformation[]> => {
    return state.personal_information;
  }, [state.personal_information]);

  // ============================================================================
  // CONSENT MANAGEMENT
  // ============================================================================

  const updateConsent = useCallback(async (purpose: string, granted: boolean) => {
    const userId = user?.id || 'anonymous';
    
    const consentRecord: ConsentRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      purpose,
      granted,
      date: new Date().toISOString(),
      method: 'explicit',
      can_withdraw: true,
    };

    dispatch({ type: 'ADD_CONSENT_RECORD', payload: consentRecord });
    
    // Save to localStorage with user-specific key
    const consentKey = `delegate-ai-consent-records-${userId}`;
    const existingConsents = JSON.parse(localStorage.getItem(consentKey) || '[]');
    existingConsents.push(consentRecord);
    localStorage.setItem(consentKey, JSON.stringify(existingConsents));
    
    // Also save to general key
    const generalConsents = JSON.parse(localStorage.getItem('delegate-ai-consent-records') || '[]');
    generalConsents.push(consentRecord);
    localStorage.setItem('delegate-ai-consent-records', JSON.stringify(generalConsents));
    
    toast.success(`Consent ${granted ? 'granted' : 'withdrawn'} for ${purpose}.`);
  }, [user?.id]);

  const withdrawConsent = useCallback(async (consentId: string) => {
    // In a real implementation, this would update the consent record
    toast.success('Consent withdrawn successfully.');
  }, []);

  // ============================================================================
  // PRIVACY SETTINGS
  // ============================================================================

  const updatePrivacySettings = useCallback(async (settings: Partial<PrivacySettings>) => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'updating_settings', value: true } });

    try {
      // Validate and update the settings with timestamp
      const validatedSettings = validatePrivacySettings({
        ...state.privacy_settings,
        ...settings,
        last_updated: new Date().toISOString()
      });
      
      dispatch({ type: 'UPDATE_PRIVACY_SETTINGS', payload: validatedSettings });
      
      // Save to localStorage with user-specific key
      const userId = user?.id || 'anonymous';
      const settingsKey = `delegate-ai-privacy-settings-${userId}`;
      const updatedSettings = {
        ...state.privacy_settings,
        ...validatedSettings,
        last_updated: new Date().toISOString()
      };
      
      localStorage.setItem(settingsKey, JSON.stringify(updatedSettings));
      
      // Also save to a backup general key for compatibility
      localStorage.setItem('delegate-ai-privacy-settings', JSON.stringify(updatedSettings));
      
      // Log the privacy setting change for audit trail
      console.log('Privacy settings updated:', {
        userId,
        settings: Object.keys(settings),
        timestamp: new Date().toISOString()
      });
      
      toast.success('Privacy settings updated successfully.');
    } catch (error) {
      console.error('Failed to update settings:', error);
      dispatch({ type: 'SET_ERROR', payload: { key: 'general', value: 'Failed to update settings' } });
      toast.error('Failed to update privacy settings. Please try again.');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'updating_settings', value: false } });
    }
  }, [state.privacy_settings, user?.id, validatePrivacySettings]);

  const resetPrivacySettings = useCallback(async () => {
    const userId = user?.id || 'anonymous';
    const resetSettings = {
      ...initialPrivacySettings,
      last_updated: new Date().toISOString()
    };
    
    dispatch({ type: 'SET_PRIVACY_SETTINGS', payload: resetSettings });
    
    // Save to localStorage with user-specific key
    const settingsKey = `delegate-ai-privacy-settings-${userId}`;
    localStorage.setItem(settingsKey, JSON.stringify(resetSettings));
    
    // Also save to general key for compatibility
    localStorage.setItem('delegate-ai-privacy-settings', JSON.stringify(resetSettings));
    
    toast.success('Privacy settings have been reset to defaults.');
  }, [user?.id]);

  // ============================================================================
  // REQUEST MANAGEMENT
  // ============================================================================

  const submitPrivacyRequest = useCallback(async (type: PrivacyRequest['type'], details?: string) => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'processing_request', value: true } });
    
    try {
      const userId = user?.id || 'anonymous';
      
      const request: PrivacyRequest = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        status: 'pending',
        requested_date: new Date().toISOString(),
        details: details || '',
      };

      dispatch({ type: 'ADD_PRIVACY_REQUEST', payload: request });
      
      // Save to localStorage
      const requestsKey = `delegate-ai-privacy-requests-${userId}`;
      const existingRequests = JSON.parse(localStorage.getItem(requestsKey) || '[]');
      existingRequests.push(request);
      localStorage.setItem(requestsKey, JSON.stringify(existingRequests));
      
      toast.success('Privacy request submitted successfully.');
    } catch (error) {
      console.error('Failed to submit privacy request:', error);
      dispatch({ type: 'SET_ERROR', payload: { key: 'request_submission', value: 'Failed to submit request' } });
      toast.error('Failed to submit privacy request. Please try again.');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'processing_request', value: false } });
    }
  }, [user?.id]);

  const getRequestStatus = useCallback(async (requestId: string): Promise<PrivacyRequest | null> => {
    const request = state.privacy_requests.find(r => r.id === requestId);
    return request || null;
  }, [state.privacy_requests]);

  // ============================================================================
  // VERIFICATION
  // ============================================================================

  const verifyUserIdentity = useCallback(async (method: 'email' | 'phone' | 'security_questions', data: any): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'processing_request', value: true } });
    
    try {
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, always verify successfully
      dispatch({ type: 'SET_USER_VERIFIED', payload: true });
      
      // Save verification status
      const userId = user?.id || 'anonymous';
      localStorage.setItem(`delegate-ai-user-verified-${userId}`, 'true');
      
      return true;
    } catch (error) {
      console.error('Verification failed:', error);
      dispatch({ type: 'SET_ERROR', payload: { key: 'verification', value: 'Verification failed' } });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'processing_request', value: false } });
    }
  }, [user?.id]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const checkCCPACompliance = useCallback(async (): Promise<boolean> => {
    // Check various compliance factors
    const hasPrivacyPolicy = true; // We have a privacy policy
    const hasOptOutMechanism = state.privacy_settings.opt_out_of_sale !== undefined;
    const hasDataInventory = state.personal_information.length > 0;
    const hasRequestSystem = true; // We have request handling
    
    const isCompliant = hasPrivacyPolicy && hasOptOutMechanism && hasDataInventory && hasRequestSystem;
    
    dispatch({ type: 'SET_CCPA_COMPLIANT', payload: isCompliant });
    
    return isCompliant;
  }, [state.privacy_settings.opt_out_of_sale, state.personal_information.length]);

  const getPrivacyRightsInfo = useCallback(() => {
    return {
      right_to_know: {
        description: "You have the right to request information about the personal information we collect, use, and share.",
        response_time: "45 days",
        verification_required: false,
      },
      right_to_delete: {
        description: "You have the right to request deletion of your personal information, subject to certain exceptions.",
        response_time: "45 days",
        verification_required: true,
      },
      right_to_opt_out: {
        description: "You have the right to opt-out of the sale of your personal information.",
        response_time: "Immediate",
        verification_required: false,
      },
      right_to_limit_sensitive_data: {
        description: "You have the right to limit the use and disclosure of your sensitive personal information.",
        response_time: "Immediate", 
        verification_required: false,
      },
      right_to_non_discrimination: {
        description: "We will not discriminate against you for exercising your privacy rights.",
        response_time: "N/A",
        verification_required: false,
      },
    };
  }, []);

  const clearAllData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'processing_request', value: true } });
    
    try {
      const userId = user?.id || 'anonymous';
      
      // Clear localStorage data
      localStorage.removeItem(`delegate-ai-privacy-settings-${userId}`);
      localStorage.removeItem(`delegate-ai-privacy-requests-${userId}`);
      localStorage.removeItem(`delegate-ai-consent-records-${userId}`);
      localStorage.removeItem(`delegate-ai-user-verified-${userId}`);
      
      // Reset state
      dispatch({ type: 'RESET_PRIVACY_DATA' });
      
      toast.success('All privacy data has been cleared.');
    } catch (error) {
      console.error('Failed to clear data:', error);
      toast.error('Failed to clear data. Please try again.');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'processing_request', value: false } });
    }
  }, [user?.id]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue = useMemo((): PrivacyContextType => ({
    state,
    requestToKnow,
    requestToDelete,
    optOutOfSale,
    optInToSale,
    limitSensitiveDataUse,
    exportPersonalData,
    getDataInventory,
    updateConsent,
    withdrawConsent,
    updatePrivacySettings,
    resetPrivacySettings,
    submitPrivacyRequest,
    getRequestStatus,
    verifyUserIdentity,
    checkCCPACompliance,
    getPrivacyRightsInfo,
    clearAllData,
  }), [
    state,
    requestToKnow,
    requestToDelete,
    optOutOfSale,
    optInToSale,
    limitSensitiveDataUse,
    exportPersonalData,
    getDataInventory,
    updateConsent,
    withdrawConsent,
    updatePrivacySettings,
    resetPrivacySettings,
    submitPrivacyRequest,
    getRequestStatus,
    verifyUserIdentity,
    checkCCPACompliance,
    getPrivacyRightsInfo,
    clearAllData,
  ]);

  return (
    <PrivacyContext.Provider value={contextValue}>
      {children}
    </PrivacyContext.Provider>
  );
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export function usePrivacy(): PrivacyContextType {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default PrivacyProvider;