export const getCallbackUrl = (): string => {
  return import.meta.env.VITE_CALLBACK_URL || `${window.location.origin}/callback`
}

export const getBackendUrl = (): string => {
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
}