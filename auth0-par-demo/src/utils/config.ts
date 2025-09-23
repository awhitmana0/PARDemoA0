export const getCallbackUrl = (): string => {
  return import.meta.env.VITE_CALLBACK_URL || `${window.location.origin}/callback`
}

export const getBackendUrl = (): string => {
  // In production, use same origin for serverless functions
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_BACKEND_URL || window.location.origin
  }
  // In development, use localhost backend
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
}