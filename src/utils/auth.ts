interface TokenResponse {
  access_token?: string
  id_token?: string
  token_type?: string
  expires_in?: number
  scope?: string
}

interface UserInfo {
  sub?: string
  name?: string
  email?: string
  picture?: string
  [key: string]: any
}

interface AuthSession {
  tokens: TokenResponse
  userInfo: UserInfo | null
  idTokenClaims: any
  flowType: string
  timestamp: number
  expiresAt?: number
}

const AUTH_SESSION_KEY = 'auth_session'

export const saveAuthSession = (
  tokens: TokenResponse,
  userInfo: UserInfo | null,
  idTokenClaims: any,
  flowType: string
): void => {
  const session: AuthSession = {
    tokens,
    userInfo,
    idTokenClaims,
    flowType,
    timestamp: Date.now(),
    expiresAt: tokens.expires_in ? Date.now() + (tokens.expires_in * 1000) : undefined
  }

  try {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
  } catch (error) {
    console.error('Failed to save auth session:', error)
  }
}

export const loadAuthSession = (): AuthSession | null => {
  try {
    const sessionData = localStorage.getItem(AUTH_SESSION_KEY)
    if (!sessionData) return null

    const session: AuthSession = JSON.parse(sessionData)

    // Check if session has expired
    if (session.expiresAt && Date.now() > session.expiresAt) {
      clearAuthSession()
      return null
    }

    return session
  } catch (error) {
    console.error('Failed to load auth session:', error)
    return null
  }
}

export const clearAuthSession = (): void => {
  try {
    localStorage.removeItem(AUTH_SESSION_KEY)
  } catch (error) {
    console.error('Failed to clear auth session:', error)
  }
}

export const isAuthenticated = (): boolean => {
  const session = loadAuthSession()
  return session !== null
}

export const getAuthSession = (): AuthSession | null => {
  return loadAuthSession()
}