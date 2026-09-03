import axios from 'axios'

export function getApiBase(): string {
  return import.meta.env.VITE_API_BASE_URL ?? '/api'
}

export const apiClient = axios.create({
  baseURL: getApiBase(),
})

export function setAuthToken(token: string | null): void {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete apiClient.defaults.headers.common.Authorization
  }
}

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('prp:unauthorized'))
    }
    return Promise.reject(err)
  },
)

export function toMessage(err: unknown): string {
  const data = (err as { response?: { data?: unknown } })?.response?.data
  if (typeof data === 'string' && data.length > 0) return data
  if (err instanceof Error) return err.message
  return 'Request failed'
}
