/// <reference types="vite/client" />
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';

declare module 'figma:asset/*' {
  /** When you do `import img from 'figma:asset/...png'`, you’ll get back a string URL */
  const url: string;
  export default url;
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_GOOGLE_ANALYTICS_ID: string
  readonly VITE_ENVIRONMENT: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_URL: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_VOICE_FEATURES: string
  readonly VITE_ENABLE_SUBSCRIPTION_FEATURES: string
  readonly VITE_DEBUG_MODE: string
  readonly VITE_LOG_LEVEL: string
  readonly VITE_ENABLE_REMOTE_LOGGING: string
  readonly VITE_ENABLE_LOG_STORAGE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

