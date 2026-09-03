import { useAuth } from '../../shared/auth/AuthContext'
import { Button, Card } from '../../shared/ui'

export function LoginPage() {
  const { login } = useAuth()
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm p-6">
        <h1 className="text-[22px] font-semibold leading-tight text-foreground">Personal Resource Planning</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Sign in with SSO to enter the console.</p>
        <Button variant="primary" className="w-full mt-5" onClick={() => void login()}>
          Sign in
        </Button>
      </Card>
    </div>
  )
}
