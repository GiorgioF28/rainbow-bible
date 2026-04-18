export type LangCode = 'it' | 'en' | 'es' | 'fr' | 'ar' | 'zh' | 'ja';

export interface LangMeta {
  code:    LangCode;
  label:   string;  // native name
  rtl:     boolean;
}

export const LANGS: LangMeta[] = [
  { code: 'it', label: 'Italiano',  rtl: false },
  { code: 'en', label: 'English',   rtl: false },
  { code: 'es', label: 'Español',   rtl: false },
  { code: 'fr', label: 'Français',  rtl: false },
  { code: 'ar', label: 'عربي',      rtl: true  },
  { code: 'zh', label: '中文',       rtl: false },
  { code: 'ja', label: '日本語',     rtl: false },
];
