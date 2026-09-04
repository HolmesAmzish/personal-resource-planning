import { useAuth } from '../../shared/auth/AuthContext'
import { useT } from '../../shared/i18n/TranslationContext'
import { Button, Card } from '../../shared/ui'

export function LoginPage() {
  const { login } = useAuth()
  const t = useT()
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm p-6">
        <h1 className="text-[22px] font-semibold leading-tight text-foreground">{t('app.title')}</h1>
        <p className="text-[13px] text-muted-foreground mt-1">{t('login.description')}</p>
        <Button variant="primary" className="w-full mt-5" onClick={() => void login()}>
          {t('login.signIn')}
        </Button>
      </Card>
    </div>
  )
}
