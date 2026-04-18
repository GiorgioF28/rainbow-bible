import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { LangCode, LANGS } from '../i18n/langs';
import { setLang, getLang } from '../i18n';

interface LangContextValue {
  lang:      LangCode;
  setLang:   (lang: LangCode) => void;
  langs:     typeof LANGS;
}

const LangContext = createContext<LangContextValue>({
  lang:    'it',
  setLang: () => {},
  langs:   LANGS,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, _setLang] = useState<LangCode>(getLang());

  const changeLang = useCallback((l: LangCode) => {
    setLang(l);
    _setLang(l);
  }, []);

  return (
    <LangContext.Provider value={{ lang, setLang: changeLang, langs: LANGS }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): LangContextValue {
  return useContext(LangContext);
}
