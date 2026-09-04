import { Menu } from 'lucide-react'
import { useT } from '../shared/i18n/TranslationContext'
import { LanguageSwitcher } from '../shared/i18n/LanguageSwitcher'

export function Header({ onMenu }: { onMenu: () => void }) {
  const t = useT()
  return (
    <header className="sticky top-0 z-20 h-[56px] bg-background/80 backdrop-blur-xl border-b border-border flex items-center gap-4 px-4 lg:px-8">
      <button aria-label={t('header.openMenu')} onClick={onMenu} className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
        <Menu size={16} />
      </button>
      <p className="text-[13px] text-muted-foreground truncate">
        {t('app.erp')} · {t('app.console')}
      </p>
      <LanguageSwitcher className="ml-auto" />
    </header>
  )
}
