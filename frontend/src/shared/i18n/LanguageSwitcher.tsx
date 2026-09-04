import { useState } from 'react'
import { ChevronDown, Globe } from 'lucide-react'
import { useLanguage, LANGUAGE_CONFIG, type SupportedLanguage } from './LanguageContext'

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[12px] font-medium bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors"
      >
        <Globe size={12} />
        <span className="hidden sm:inline">{LANGUAGE_CONFIG[language].label}</span>
        <ChevronDown size={12} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-28 rounded-xl bg-card border border-border shadow-lg overflow-hidden">
            {(Object.keys(LANGUAGE_CONFIG) as SupportedLanguage[]).map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-2 text-left text-[12px] font-medium border-b border-border last:border-0 transition-colors ${
                  language === lang ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {LANGUAGE_CONFIG[lang].label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}