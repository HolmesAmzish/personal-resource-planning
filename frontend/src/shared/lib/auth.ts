import { UserManager, type UserManagerSettings } from 'oidc-client-ts'

export function getOidcConfig(): UserManagerSettings {
  const redirectUri =
    import.meta.env.VITE_OAUTH_REDIRECT_URI ?? `${window.location.origin}/callback`
  return {
    authority: import.meta.env.VITE_OAUTH_AUTHORITY ?? 'https://auth.arorms.cn/realms/arorms',
    client_id: import.meta.env.VITE_OAUTH_CLIENT_ID ?? 'prp-react',
    redirect_uri: redirectUri,
    post_logout_redirect_uri: window.location.origin,
    response_type: 'code',
    scope: 'openid profile email',
  }
}

let manager: UserManager | null = null

export function getUserManager(): UserManager {
  if (!manager) manager = new UserManager(getOidcConfig())
  return manager
}
