import { useT } from '../../shared/i18n/TranslationContext'
import { Card } from '../../shared/ui'

export function HrPlaceholderPage() {
  const t = useT()
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold leading-tight text-foreground">{t('hr.title')}</h1>
        <p className="text-[13px] text-muted-foreground mt-1">{t('hr.subtitle')}</p>
      </div>
      <Card className="p-10 text-center">
        <p className="text-[13px] text-muted-foreground">{t('hr.stub')}</p>
      </Card>
    </div>
  )
}
