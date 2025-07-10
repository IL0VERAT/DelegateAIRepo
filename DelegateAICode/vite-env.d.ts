/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_GOOGLE_ANALYTICS_ID: string
  readonly VITE_HOTJAR_ID: string
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

declare module '*.svg' {
  import React from 'react'
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
  export { ReactComponent }
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

declare module '*.ico' {
  const content: string
  export default content
}

declare module '*.bmp' {
  const content: string
  export default content
}

declare module '*.css' {
  const content: Record<string, string>
  export default content
}

declare module '*.module.css' {
  const content: Record<string, string>
  export default content
}