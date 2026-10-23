/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare const __BUILD_TIME__: string;

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY?: string;
  readonly [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
