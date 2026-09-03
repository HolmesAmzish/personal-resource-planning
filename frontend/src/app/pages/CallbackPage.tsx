import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/auth/AuthContext'
import { Spinner } from '../../shared/ui'

export function CallbackPage() {
  const { handleCallback } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    handleCallback()
      .then(() => navigate('/', { replace: true }))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Sign-in callback failed'))
  }, [handleCallback, navigate])

  return (
    <div className="min-h-screen bg-background flex flex-col gap-3 items-center justify-center p-4">
      {error ? <p className="text-[13px] text-danger">{error}</p> : <Spinner />}
    </div>
  )
}
