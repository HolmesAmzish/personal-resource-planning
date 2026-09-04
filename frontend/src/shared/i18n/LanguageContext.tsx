import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type SupportedLanguage = 'ZH' | 'EN'

export const LANGUAGE_CONFIG = {
  ZH: { label: '中文', locale: 'zh-CN' },
  EN: { label: 'English', locale: 'en-US' },
} as const

const DEFAULT_LANGUAGE: SupportedLanguage = 'EN'
const LANGUAGE_STORAGE_KEY = 'preferred_language'

const detectBrowserLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE
  const browserLang = navigator.language || 'en'
  if (browserLang.includes('zh')) return 'ZH'
  if (browserLang.includes('en')) return 'EN'
  return DEFAULT_LANGUAGE
}

const getStoredLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (stored && (stored === 'ZH' || stored === 'EN')) return stored
  } catch {
    /* storage unavailable */
  }
  return detectBrowserLanguage()
}

interface LanguageContextType {
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
  locale: string
  isChinese: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)
export { LanguageContext }

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(getStoredLanguage)
  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    } catch {
      /* storage unavailable */
    }
  }, [language])

  const setLanguage = (lang: SupportedLanguage) => setLanguageState(lang)
  const locale = LANGUAGE_CONFIG[language].locale
  const isChinese = language === 'ZH'

  return (
    <LanguageContext.Provider value={{ language, setLanguage, locale, isChinese }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    return { language: DEFAULT_LANGUAGE, setLanguage: () => {}, locale: LANGUAGE_CONFIG[DEFAULT_LANGUAGE].locale, isChinese: false }
  }
  return context
}

export function useIsChinese() {
  return useLanguage().isChinese
}

export function useLanguageConfig() {
  const { language } = useLanguage()
  return LANGUAGE_CONFIG[language]
}