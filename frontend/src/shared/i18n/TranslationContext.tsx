import { createContext, useCallback, useContext, type ReactNode } from 'react'
import { LanguageContext, LanguageProvider, useLanguage, type SupportedLanguage } from './LanguageContext'
import { en, zh, type Translations } from '../../i18n/translations'

export { LanguageContext, LanguageProvider, useLanguage, type SupportedLanguage }

interface TranslationContextType {
  t: (key: string) => string
  language: SupportedLanguage
  locale: string
  isChinese: boolean
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

const getTranslation = (translations: Translations, key: string): string => {
  const keys = key.split('.')
  let value: unknown = translations
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k]
    } else {
      return key
    }
  }
  return typeof value === 'string' ? value : key
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const { language, locale, isChinese } = useLanguage()
  const t = useCallback(
    (key: string): string => getTranslation(language === 'ZH' ? zh : en, key),
    [language],
  )

  return (
    <TranslationContext.Provider value={{ t, language, locale, isChinese }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    return { t: (key: string) => key, language: 'EN' as SupportedLanguage, locale: 'en-US', isChinese: false }
  }
  return context
}

export function useT() {
  return useTranslation().t
}