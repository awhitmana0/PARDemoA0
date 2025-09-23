export const STORAGE_KEYS = {
  OAUTH_CONFIG: 'auth0-demo-oauth-config',
  PAR_CONFIG: 'auth0-demo-par-config'
} as const

export const saveConfig = (key: string, config: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(config))
  } catch (error) {
    console.warn('Failed to save configuration to localStorage:', error)
  }
}

export const loadConfig = <T>(key: string, defaultConfig: T): T => {
  try {
    const saved = localStorage.getItem(key)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    console.warn('Failed to load configuration from localStorage:', error)
  }
  return defaultConfig
}

export const clearConfig = (key: string) => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn('Failed to clear configuration from localStorage:', error)
  }
}