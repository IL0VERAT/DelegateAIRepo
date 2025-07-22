import { useEffect } from 'react';
import { useApp } from './AppContext';
import { environment } from '../config/environment';
import { useAuth } from './AuthContext';

interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  type: 'website' | 'article';
  image?: string;
  url?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

// SEO configuration for each view
const SEO_CONFIG: Record<string, SEOData> = {
  chat: {
    title: 'AI Chat Assistant - Delegate AI',
    description: 'Engage in intelligent conversations with Delegate AI\'s advanced chat interface. Choose from 5 AI personality modes for personalized assistance with collaborative, gentle, balanced, challenging, or aggressive communication styles.',
    keywords: ['AI chat', 'artificial intelligence', 'AI assistant', 'chatbot', 'conversation AI', 'AI personalities', 'intelligent assistant'],
    type: 'website',
    image: '/og-image-chat.png',
  },
  voice: {
    title: 'Voice AI Assistant - Delegate AI',
    description: 'Experience hands-free AI conversations with Delegate AI\'s voice interface. Natural speech recognition and text-to-speech technology for fluid, real-time AI interactions with transcription capabilities.',
    keywords: ['voice AI', 'speech recognition', 'text to speech', 'voice assistant', 'AI conversation', 'voice interface', 'hands-free AI'],
    type: 'website',
    image: '/og-image-voice.png',
  },
  transcripts: {
    title: 'Conversation Transcripts - Delegate AI',
    description: 'Access and manage your AI conversation history. Search through past chat and voice interactions, export transcripts, and track your AI assistant usage patterns.',
    keywords: ['AI transcripts', 'conversation history', 'chat history', 'voice transcripts', 'AI logs', 'conversation search'],
    type: 'website',
    image: '/og-image-transcripts.png',
  },
  settings: {
    title: 'Settings & Preferences - Delegate AI',
    description: 'Customize your Delegate AI experience. Configure AI personality modes, voice settings, privacy preferences, and personalize your intelligent assistant to match your communication style.',
    keywords: ['AI settings', 'AI preferences', 'AI personality', 'voice settings', 'AI configuration', 'assistant customization'],
    type: 'website',
    image: '/og-image-settings.png',
  },
  legal: {
    title: 'Privacy Policy & Terms - Delegate AI',
    description: 'Review Delegate AI\'s privacy policy, terms of service, and data usage guidelines. Learn how we protect your conversations and manage your AI interaction data.',
    keywords: ['privacy policy', 'terms of service', 'data privacy', 'AI privacy', 'legal terms', 'data protection'],
    type: 'article',
    image: '/og-image-legal.png',
  },
};

// Default SEO data
const DEFAULT_SEO: SEOData = {
  title: 'Delegate AI - Intelligent Assistant with Multiple Personalities',
  description: 'Advanced AI assistant with 5 distinct personality modes. Experience natural conversations through chat and voice interfaces. Collaborative, gentle, balanced, challenging, or aggressive AI communication styles.',
  keywords: ['AI assistant', 'artificial intelligence', 'AI chat', 'voice AI', 'AI personalities', 'intelligent assistant', 'conversation AI', 'AI communication'],
  type: 'website',
  image: '/og-image-default.png',
};

// Utility functions for meta tag management
const updateMetaTag = (property: string, content: string, isProperty = true) => {
  const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
  let metaTag = document.querySelector(selector) as HTMLMetaElement;
  
  if (!metaTag) {
    metaTag = document.createElement('meta');
    if (isProperty) {
      metaTag.setAttribute('property', property);
    } else {
      metaTag.setAttribute('name', property);
    }
    document.head.appendChild(metaTag);
  }
  
  metaTag.setAttribute('content', content);
};

const updateLinkTag = (rel: string, href: string) => {
  let linkTag = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  
  if (!linkTag) {
    linkTag = document.createElement('link');
    linkTag.setAttribute('rel', rel);
    document.head.appendChild(linkTag);
  }
  
  linkTag.setAttribute('href', href);
};

const removeMetaTag = (property: string, isProperty = true) => {
  const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
  const metaTag = document.querySelector(selector);
  if (metaTag) {
    metaTag.remove();
  }
};

// Generate structured data for the application
const generateStructuredData = (seoData: SEOData) => {
  const currentUrl = window.location.href;
  const baseUrl = window.location.origin;
  
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Delegate AI",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "Advanced AI assistant with multiple personality modes for personalized communication",
    "url": baseUrl,
    "author": {
      "@type": "Organization",
      "name": "Delegate AI"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "AI Chat Interface",
      "Voice Conversations", 
      "Multiple AI Personalities",
      "Conversation Transcripts",
      "Real-time Speech Recognition",
      "Text-to-Speech Technology"
    ],
    "screenshot": `${baseUrl}/og-image-default.png`,
    "softwareVersion": environment.version,
    "releaseNotes": "Advanced AI assistant with personality modes",
    "applicationSubCategory": "AI Assistant",
    "downloadUrl": currentUrl,
    "installUrl": currentUrl,
    //"memoryRequirements": "512MB",
    //"storageRequirements": "50MB"
  };

  const webPageData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": seoData.title,
    "description": seoData.description,
    "url": currentUrl,
    "mainEntity": {
      "@type": "SoftwareApplication",
      "name": "Delegate AI",
      "applicationCategory": "AI Assistant"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": baseUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": seoData.title.split(' - ')[0],
          "item": currentUrl
        }
      ]
    }
  };

  return [organizationData, webPageData];
};

// Update structured data in the document head
const updateStructuredData = (seoData: SEOData) => {
  // Remove existing structured data
  const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
  existingScripts.forEach(script => script.remove());

  // Add new structured data
  const structuredDataArray = generateStructuredData(seoData);
  
  structuredDataArray.forEach((data) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data, null, 2);
    document.head.appendChild(script);
  });
};

// Hook for managing SEO
export const useSEO = (customSEO?: Partial<SEOData>) => {
  const { currentView} = useApp();
  const {user} = useAuth();
  
  useEffect(() => {
    const viewSEO = SEO_CONFIG[currentView] || DEFAULT_SEO;
    const finalSEO: SEOData = { ...viewSEO, ...customSEO };
    
    // Update document title
    const titleSuffix = environment.ENABLE_MOCK_DATA ? ' (Demo)' : '';
    const fullTitle = `${finalSEO.title}${titleSuffix}`;
    document.title = fullTitle;
    
    // Basic meta tags
    updateMetaTag('description', finalSEO.description, false);
    updateMetaTag('keywords', finalSEO.keywords.join(', '), false);
    updateMetaTag('author', finalSEO.author || 'Delegate AI', false);
    updateMetaTag('robots', 'index, follow', false);
    updateMetaTag('language', 'en', false);
    updateMetaTag('revisit-after', '7 days', false);
    
    // Open Graph tags
    updateMetaTag('og:title', fullTitle);
    updateMetaTag('og:description', finalSEO.description);
    updateMetaTag('og:type', finalSEO.type);
    updateMetaTag('og:url', finalSEO.url || window.location.href);
    updateMetaTag('og:site_name', 'Delegate AI');
    updateMetaTag('og:locale', 'en_US');
    
    if (finalSEO.image) {
      updateMetaTag('og:image', `${window.location.origin}${finalSEO.image}`);
      updateMetaTag('og:image:alt', `${finalSEO.title} - Visual Preview`);
    }
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', false);
    updateMetaTag('twitter:title', fullTitle, false);
    updateMetaTag('twitter:description', finalSEO.description, false);
    updateMetaTag('twitter:site', '@DelegateAI', false);
    updateMetaTag('twitter:creator', '@DelegateAI', false);
    
    if (finalSEO.image) {
      updateMetaTag('twitter:image', `${window.location.origin}${finalSEO.image}`, false);
      updateMetaTag('twitter:image:alt', `${finalSEO.title} - Visual Preview`, false);
    }
    
    // Additional meta tags for AI/Tech applications
    updateMetaTag('application-name', 'Delegate AI', false);
    updateMetaTag('msapplication-TileColor', '#5B9BD5', false);
    updateMetaTag('theme-color', '#5B9BD5', false);
    updateMetaTag('apple-mobile-web-app-title', 'Delegate AI', false);
    updateMetaTag('apple-mobile-web-app-capable', 'yes', false);
    updateMetaTag('apple-mobile-web-app-status-bar-style', 'default', false);
    
    // Article-specific tags
    if (finalSEO.type === 'article') {
      if (finalSEO.author) {
        updateMetaTag('article:author', finalSEO.author);
      }
      if (finalSEO.publishedTime) {
        updateMetaTag('article:published_time', finalSEO.publishedTime);
      }
      if (finalSEO.modifiedTime) {
        updateMetaTag('article:modified_time', finalSEO.modifiedTime);
      }
      updateMetaTag('article:section', 'AI Technology');
      finalSEO.keywords.forEach(tag => {
        updateMetaTag('article:tag', tag);
      });
    }
    
    // Canonical URL
    updateLinkTag('canonical', window.location.href);
    
    // Update structured data
    updateStructuredData(finalSEO);
    
    // Update favicon based on current view
    const faviconPath = currentView === 'voice' ? '/favicon-voice.ico' : '/favicon.ico';
    updateLinkTag('icon', faviconPath);
    
    // Cleanup function
    return () => {
      // Reset to default title when component unmounts
      document.title = DEFAULT_SEO.title + titleSuffix;
    };
  }, [currentView, customSEO, user]);
};

// Component for managing global SEO
export const SEOManager: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  useSEO();
  
  useEffect(() => {
    // Add global meta tags that don't change
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no', false);
    updateMetaTag('format-detection', 'telephone=no', false);
    updateMetaTag('generator', 'Delegate AI Application', false);
    updateMetaTag('rating', 'general', false);
    updateMetaTag('distribution', 'global', false);
    updateMetaTag('copyright', `© ${new Date().getFullYear()} Delegate AI`, false);
    
    // Add DNS prefetch for potential external resources
    const dnsPrefetchLinks = [
      'https://api.openai.com',
      'https://fonts.googleapis.com',
      'https://cdn.jsdelivr.net'
    ];
    
    dnsPrefetchLinks.forEach(url => {
      const linkTag = document.createElement('link');
      linkTag.rel = 'dns-prefetch';
      linkTag.href = url;
      document.head.appendChild(linkTag);
    });
    
    // Add preconnect for critical resources
    const preconnectLinks = [
      'https://fonts.gstatic.com'
    ];
    
    preconnectLinks.forEach(url => {
      const linkTag = document.createElement('link');
      linkTag.rel = 'preconnect';
      linkTag.href = url;
      linkTag.crossOrigin = 'anonymous';
      document.head.appendChild(linkTag);
    });
    
  }, []);
  
  return <>{children}</>;
};

// Helper function to update SEO for specific content
export const updateSEOForContent = (title: string, description?: string) => {
  const customSEO: Partial<SEOData> = {
    title,
    description: description || `${title} - Delegate AI`,
  };
  
  return customSEO;
};

// Export SEO configuration for external use
export { SEO_CONFIG, DEFAULT_SEO };