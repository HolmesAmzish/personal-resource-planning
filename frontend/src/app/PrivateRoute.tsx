import { Navigate } from 'react-router-dom'
import { useAuth } from '../shared/auth/AuthContext'
import { Spinner } from '../shared/ui'
import type { JSX } from 'react'

export function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, ready } = useAuth()
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}
