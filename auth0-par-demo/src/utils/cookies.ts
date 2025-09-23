interface ConfigType {
  client_id: string
  response_type: string
  scope: string
  audience: string
  state: string
  domain: string
  prompt: string
  client_secret?: string
}

interface SharedConfigType {
  regular: ConfigType
  par: ConfigType
}

const COOKIE_NAME = 'auth0-demo-config'
const COOKIE_EXPIRY_DAYS = 30

export const saveConfigToCookies = (config: SharedConfigType): void => {
  try {
    const configString = JSON.stringify(config)
    const expiryDate = new Date()
    expiryDate.setTime(expiryDate.getTime() + (COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000))
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(configString)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`
    console.log('✅ Configuration saved to cookies')
  } catch (error) {
    console.error('❌ Failed to save configuration to cookies:', error)
  }
}

export const loadConfigFromCookies = (): SharedConfigType | null => {
  try {
    const cookies = document.cookie.split(';')
    const configCookie = cookies.find(cookie =>
      cookie.trim().startsWith(`${COOKIE_NAME}=`)
    )

    if (!configCookie) {
      return null
    }

    const configString = decodeURIComponent(
      configCookie.split('=')[1]
    )
    const config = JSON.parse(configString) as SharedConfigType
    console.log('✅ Configuration loaded from cookies')
    return config
  } catch (error) {
    console.error('❌ Failed to load configuration from cookies:', error)
    return null
  }
}

export const clearConfigFromCookies = (): void => {
  try {
    document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`
    console.log('✅ Configuration cookies cleared')
  } catch (error) {
    console.error('❌ Failed to clear configuration cookies:', error)
  }
}

export const hasConfigInCookies = (): boolean => {
  return document.cookie.includes(`${COOKIE_NAME}=`)
}