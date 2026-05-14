/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_PATH?: string;
  readonly VITE_GITHUB_PAGES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
