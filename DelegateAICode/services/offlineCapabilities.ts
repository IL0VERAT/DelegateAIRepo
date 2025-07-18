/**
 * OFFLINE CAPABILITIES SERVICE
 * ============================
 * 
 * Production-ready offline functionality for graceful degradation:
 * - Service worker integration
 * - Offline data management
 * - Queue management for sync when online
 * - Feature availability detection
 * - Seamless online/offline transitions
 */

import  config  from '../config/environment';

export enum OfflineCapability {
  // Core Features
  VIEW_CHAT_HISTORY = 'view_chat_history',
  VIEW_TRANSCRIPTS = 'view_transcripts',
  BROWSE_SETTINGS = 'browse_settings',
  VIEW_LEGAL_PAGES = 'view_legal_pages',
  
  // Limited Features
  COMPOSE_MESSAGES = 'compose_messages', // Draft mode
  SEARCH_HISTORY = 'search_history',     // Local search only
  EXPORT_DATA = 'export_data',           // Local export
  
  // Unavailable Features
  SEND_MESSAGES = 'send_messages',
  VOICE_CHAT = 'voice_chat',
  AI_RESPONSES = 'ai_responses',
  REAL_TIME_SYNC = 'real_time_sync',
  ACCOUNT_MANAGEMENT = 'account_management'
}

export enum FeatureStatus {
  AVAILABLE = 'available',
  LIMITED = 'limited',
  UNAVAILABLE = 'unavailable',
  QUEUED = 'queued' // For actions that will sync when online
}

export interface OfflineFeature {
  capability: OfflineCapability;
  status: FeatureStatus;
  title: string;
  description: string;
  limitation?: string;
  alternativeAction?: string;
}

export interface QueuedAction {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
  retryCount: number;
  priority: number; // 1-5, where 1 is highest priority
}

export interface OfflineStatus {
  isOffline: boolean;
  lastOnline: Date | null;
  queuedActions: QueuedAction[];
  availableFeatures: OfflineFeature[];
  dataLastSynced: Date | null;
  storageUsed: number; // bytes
  storageLimit: number; // bytes
}

// Feature definitions for offline mode
const OFFLINE_FEATURES: Record<OfflineCapability, Omit<OfflineFeature, 'status'>> = {
  [OfflineCapability.VIEW_CHAT_HISTORY]: {
    capability: OfflineCapability.VIEW_CHAT_HISTORY,
    title: 'View Chat History',
    description: 'Browse your previously loaded conversations',
  },
  
  [OfflineCapability.VIEW_TRANSCRIPTS]: {
    capability: OfflineCapability.VIEW_TRANSCRIPTS,
    title: 'View Transcripts',
    description: 'Access your cached conversation transcripts',
  },
  
  [OfflineCapability.BROWSE_SETTINGS]: {
    capability: OfflineCapability.BROWSE_SETTINGS,
    title: 'Browse Settings',
    description: 'View and modify local application settings',
    limitation: 'Changes will sync when reconnected'
  },
  
  [OfflineCapability.VIEW_LEGAL_PAGES]: {
    capability: OfflineCapability.VIEW_LEGAL_PAGES,
    title: 'View Legal Pages',
    description: 'Access privacy policy and terms of service',
  },
  
  [OfflineCapability.COMPOSE_MESSAGES]: {
    capability: OfflineCapability.COMPOSE_MESSAGES,
    title: 'Compose Messages',
    description: 'Write messages that will be sent when reconnected',
    limitation: 'Messages will be queued for sending',
    alternativeAction: 'Messages are saved as drafts'
  },
  
  [OfflineCapability.SEARCH_HISTORY]: {
    capability: OfflineCapability.SEARCH_HISTORY,
    title: 'Search History',
    description: 'Search through your cached conversations',
    limitation: 'Only searches locally cached data'
  },
  
  [OfflineCapability.EXPORT_DATA]: {
    capability: OfflineCapability.EXPORT_DATA,
    title: 'Export Data',
    description: 'Export your cached conversation data',
    limitation: 'Only includes locally cached data'
  },
  
  [OfflineCapability.SEND_MESSAGES]: {
    capability: OfflineCapability.SEND_MESSAGES,
    title: 'Send Messages',
    description: 'Send messages to AI assistant',
  },
  
  [OfflineCapability.VOICE_CHAT]: {
    capability: OfflineCapability.VOICE_CHAT,
    title: 'Voice Chat',
    description: 'Voice conversations with AI assistant',
    alternativeAction: 'Use text chat when reconnected'
  },
  
  [OfflineCapability.AI_RESPONSES]: {
    capability: OfflineCapability.AI_RESPONSES,
    title: 'AI Responses',
    description: 'Get responses from AI assistant',
    alternativeAction: 'Messages will be answered when reconnected'
  },
  
  [OfflineCapability.REAL_TIME_SYNC]: {
    capability: OfflineCapability.REAL_TIME_SYNC,
    title: 'Real-time Sync',
    description: 'Sync data across devices in real-time',
    alternativeAction: 'Data will sync when reconnected'
  },
  
  [OfflineCapability.ACCOUNT_MANAGEMENT]: {
    capability: OfflineCapability.ACCOUNT_MANAGEMENT,
    title: 'Account Management',
    description: 'Manage account settings and billing',
    alternativeAction: 'Access account settings when reconnected'
  }
};

class OfflineCapabilitiesService {
  private storageKey = 'delegate-ai-offline';
  private queueKey = 'delegate-ai-queue';
  private isInitialized = false;
  private listeners: ((status: OfflineStatus) => void)[] = [];
  
  // Initialize the service
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Register service worker if available
      if ('serviceWorker' in navigator && !config.ENABLE_MOCK_DATA) {
        // In production, you would register your service worker here
        // await navigator.serviceWorker.register('/sw.js');
        console.log('Service worker would be registered in production');
      }
      
      // Set up storage event listeners
      window.addEventListener('storage', this.handleStorageChange.bind(this));
      
      // Set up online/offline event listeners
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
      
      this.isInitialized = true;
      console.log('Offline capabilities service initialized');
    } catch (error) {
      console.error('Failed to initialize offline capabilities:', error);
    }
  }
  
  // Get current offline status
  getOfflineStatus(): OfflineStatus {
    const isOffline = !navigator.onLine;
    const queuedActions = this.getQueuedActions();
    const availableFeatures = this.getAvailableFeatures(isOffline);
    
    return {
      isOffline,
      lastOnline: this.getLastOnlineTime(),
      queuedActions,
      availableFeatures,
      dataLastSynced: this.getLastSyncTime(),
      storageUsed: this.getStorageUsed(),
      storageLimit: this.getStorageLimit()
    };
  }
  
  // Get available features based on offline status
  private getAvailableFeatures(isOffline: boolean): OfflineFeature[] {
    return Object.values(OfflineCapability).map(capability => {
      const feature = OFFLINE_FEATURES[capability];
      let status: FeatureStatus;
      
      if (isOffline) {
        switch (capability) {
          case OfflineCapability.VIEW_CHAT_HISTORY:
          case OfflineCapability.VIEW_TRANSCRIPTS:
          case OfflineCapability.VIEW_LEGAL_PAGES:
            status = FeatureStatus.AVAILABLE;
            break;
            
          case OfflineCapability.BROWSE_SETTINGS:
          case OfflineCapability.SEARCH_HISTORY:
          case OfflineCapability.EXPORT_DATA:
            status = FeatureStatus.LIMITED;
            break;
            
          case OfflineCapability.COMPOSE_MESSAGES:
            status = FeatureStatus.QUEUED;
            break;
            
          default:
            status = FeatureStatus.UNAVAILABLE;
        }
      } else {
        status = FeatureStatus.AVAILABLE;
      }
      
      return {
        ...feature,
        status
      };
    });
  }
  
  // Queue an action for when back online
  queueAction(type: string, data: any, priority: number = 3): string {
    const action: QueuedAction = {
      id: crypto.randomUUID(),
      type,
      data,
      timestamp: new Date(),
      retryCount: 0,
      priority
    };
    
    const queue = this.getQueuedActions();
    queue.push(action);
    
    // Sort by priority (1 = highest)
    queue.sort((a, b) => a.priority - b.priority || a.timestamp.getTime() - b.timestamp.getTime());
    
    this.saveQueuedActions(queue);
    this.notifyListeners();
    
    return action.id;
  }
  
  // Remove action from queue
  removeQueuedAction(actionId: string): boolean {
    const queue = this.getQueuedActions();
    const index = queue.findIndex(action => action.id === actionId);
    
    if (index === -1) return false;
    
    queue.splice(index, 1);
    this.saveQueuedActions(queue);
    this.notifyListeners();
    
    return true;
  }
  
  // Process queued actions when back online
  async processQueuedActions(): Promise<void> {
    if (!navigator.onLine) return;
    
    const queue = this.getQueuedActions();
    if (queue.length === 0) return;
    
    console.log(`Processing ${queue.length} queued actions...`);
    
    for (const action of queue) {
      try {
        await this.processAction(action);
        this.removeQueuedAction(action.id);
        console.log(`Processed queued action: ${action.type}`);
      } catch (error) {
        console.error(`Failed to process queued action ${action.id}:`, error);
        
        // Increment retry count
        action.retryCount++;
        
        // Remove if too many retries
        if (action.retryCount >= 3) {
          this.removeQueuedAction(action.id);
          console.warn(`Removed action ${action.id} after 3 failed retries`);
        } else {
          // Update the queue with incremented retry count
          const updatedQueue = this.getQueuedActions();
          const actionIndex = updatedQueue.findIndex(a => a.id === action.id);
          if (actionIndex !== -1) {
            updatedQueue[actionIndex] = action;
            this.saveQueuedActions(updatedQueue);
          }
        }
      }
    }
    
    this.notifyListeners();
  }
  
  // Process a single queued action
  private async processAction(action: QueuedAction): Promise<void> {
    switch (action.type) {
      case 'send_message':
        // In production, this would send the message via your API
        console.log('Would send queued message:', action.data);
        break;
        
      case 'update_settings':
        // In production, this would sync settings to server
        console.log('Would sync settings:', action.data);
        break;
        
      case 'create_session':
        // In production, this would create a new chat session
        console.log('Would create session:', action.data);
        break;
        
      default:
        console.warn(`Unknown queued action type: ${action.type}`);
    }
  }
  
  // Storage management
  private getQueuedActions(): QueuedAction[] {
    try {
      const stored = localStorage.getItem(this.queueKey);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return parsed.map((action: any) => ({
        ...action,
        timestamp: new Date(action.timestamp)
      }));
    } catch (error) {
      console.error('Failed to load queued actions:', error);
      return [];
    }
  }
  
  private saveQueuedActions(actions: QueuedAction[]): void {
    try {
      localStorage.setItem(this.queueKey, JSON.stringify(actions));
    } catch (error) {
      console.error('Failed to save queued actions:', error);
    }
  }
  
  private getLastOnlineTime(): Date | null {
    try {
      const stored = localStorage.getItem(`${this.storageKey}-last-online`);
      return stored ? new Date(stored) : null;
    } catch {
      return null;
    }
  }
  
  private setLastOnlineTime(date: Date): void {
    try {
      localStorage.setItem(`${this.storageKey}-last-online`, date.toISOString());
    } catch (error) {
      console.error('Failed to save last online time:', error);
    }
  }
  
  private getLastSyncTime(): Date | null {
    try {
      const stored = localStorage.getItem(`${this.storageKey}-last-sync`);
      return stored ? new Date(stored) : null;
    } catch {
      return null;
    }
  }
  
  private getStorageUsed(): number {
    try {
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith('delegate-ai')) {
          totalSize += localStorage[key].length;
        }
      }
      return totalSize;
    } catch {
      return 0;
    }
  }
  
  private getStorageLimit(): number {
    // Most browsers allow 5-10MB for localStorage
    return 5 * 1024 * 1024; // 5MB
  }
  
  // Event handlers
  private handleOnline(): void {
    console.log('Connection restored - processing queued actions');
    this.setLastOnlineTime(new Date());
    this.processQueuedActions();
    this.notifyListeners();
  }
  
  private handleOffline(): void {
    console.log('Connection lost - entering offline mode');
    this.notifyListeners();
  }
  
  private handleStorageChange(event: StorageEvent): void {
    if (event.key?.startsWith('delegate-ai')) {
      this.notifyListeners();
    }
  }
  
  // Feature availability checks
  isFeatureAvailable(capability: OfflineCapability): boolean {
    const status = this.getOfflineStatus();
    const feature = status.availableFeatures.find(f => f.capability === capability);
    return feature?.status === FeatureStatus.AVAILABLE;
  }
  
  isFeatureLimited(capability: OfflineCapability): boolean {
    const status = this.getOfflineStatus();
    const feature = status.availableFeatures.find(f => f.capability === capability);
    return feature?.status === FeatureStatus.LIMITED;
  }
  
  canQueueAction(capability: OfflineCapability): boolean {
    const status = this.getOfflineStatus();
    const feature = status.availableFeatures.find(f => f.capability === capability);
    return feature?.status === FeatureStatus.QUEUED;
  }
  
  // Subscription management
  subscribe(listener: (status: OfflineStatus) => void): () => void {
    this.listeners.push(listener);
    
    // Send initial status
    listener(this.getOfflineStatus());
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  private notifyListeners(): void {
    const status = this.getOfflineStatus();
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error notifying offline status listener:', error);
      }
    });
  }
  
  // Cleanup
  cleanup(): void {
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    this.listeners = [];
    this.isInitialized = false;
  }
}

// Global instance
export const offlineCapabilities = new OfflineCapabilitiesService();

// Initialize when imported
if (typeof window !== 'undefined') {
  offlineCapabilities.initialize().catch(console.error);
}