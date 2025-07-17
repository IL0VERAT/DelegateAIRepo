/// <reference types="vite/client" />

interface ImportMetaEnv {
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

