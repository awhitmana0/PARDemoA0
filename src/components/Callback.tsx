import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getBackendUrl } from '../utils/config'
import { decodeJWT, formatTokenClaims } from '../utils/jwt'
import { loadConfigFromCookies } from '../utils/cookies'

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

const Callback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [tokens, setTokens] = useState<TokenResponse | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [idTokenClaims, setIdTokenClaims] = useState<any>(null)
  const [isRealTokens, setIsRealTokens] = useState(false)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const authError = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        if (authError) {
          setError(`Authorization failed: ${authError} - ${errorDescription || 'Unknown error'}`)
          return
        }

        if (!code) {
          setError('No authorization code received')
          return
        }

        console.log('Received authorization code:', code)
        console.log('State parameter:', state)

        // Try to get configuration from cookies to determine which client to use
        const savedConfig = loadConfigFromCookies()

        if (!savedConfig) {
          console.log('No saved configuration found, using mock tokens for demo')
          // Fallback to mock tokens if no config is available
          const mockTokens: TokenResponse = {
            access_token: 'mock_access_token_' + Math.random().toString(36).substr(2, 9),
            id_token: 'mock_id_token_' + Math.random().toString(36).substr(2, 9),
            token_type: 'Bearer',
            expires_in: 3600,
            scope: 'openid profile email'
          }

          const mockUserInfo: UserInfo = {
            sub: 'user123',
            name: 'John Doe',
            email: 'john.doe@example.com',
            picture: 'https://via.placeholder.com/100'
          }

          setTokens(mockTokens)
          setUserInfo(mockUserInfo)
          setIsRealTokens(false)
          return
        }

        // Determine which config to use based on current URL or stored preference
        // For now, try PAR config first, then regular
        let configToUse = savedConfig.par
        let flowType = 'PAR'

        // If PAR config doesn't have client_secret, use regular config
        if (!configToUse.client_secret) {
          configToUse = savedConfig.regular
          flowType = 'Regular OAuth'
        }

        console.log(`Attempting token exchange using ${flowType} configuration`)

        // Exchange authorization code for real tokens
        const tokenEndpoint = `${getBackendUrl()}/api/token`

        const tokenRequestBody = {
          domain: configToUse.domain,
          client_id: configToUse.client_id,
          client_secret: configToUse.client_secret,
          code: code,
          redirect_uri: window.location.origin + '/callback'
        }

        console.log('🔵 Requesting token exchange:', {
          ...tokenRequestBody,
          client_secret: tokenRequestBody.client_secret ? '[REDACTED]' : undefined
        })

        const tokenResponse = await fetch(tokenEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(tokenRequestBody)
        })

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text()
          console.log('🔴 Token exchange failed:', errorText)
          throw new Error(`Token exchange failed: ${tokenResponse.status} ${errorText}`)
        }

        const tokenData = await tokenResponse.json()
        console.log('✅ Real tokens received:', {
          ...tokenData,
          access_token: tokenData.access_token ? '[REDACTED]' : undefined,
          id_token: tokenData.id_token ? '[REDACTED]' : undefined
        })

        setTokens(tokenData)
        setIsRealTokens(true)

        // Parse ID token if present
        if (tokenData.id_token) {
          const decodedIdToken = decodeJWT(tokenData.id_token)
          if (decodedIdToken) {
            console.log('✅ ID Token decoded:', decodedIdToken)
            setIdTokenClaims(decodedIdToken)

            // Extract user info from ID token
            const userInfoFromToken: UserInfo = {
              sub: decodedIdToken.sub,
              name: decodedIdToken.name,
              email: decodedIdToken.email,
              picture: decodedIdToken.picture,
              nickname: decodedIdToken.nickname,
              email_verified: decodedIdToken.email_verified
            }
            setUserInfo(userInfoFromToken)
          }
        }

      } catch (err) {
        console.error('Callback error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    handleCallback()
  }, [searchParams])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Authentication</h2>
          <p className="text-gray-600">Please wait while we process your authorization callback...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-100">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Authentication Complete
              </h1>
              <p className="text-gray-600 mt-1">Successfully authenticated with Auth0</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Demo
              </button>
              <button
                onClick={() => {
                  // Clear any stored auth state and redirect to home
                  window.location.href = '/'
                }}
                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout & Restart
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {error ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg border border-red-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600">✕</span>
                </div>
                <h2 className="text-xl font-semibold text-red-800">Authorization Failed</h2>
              </div>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Success Header */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <span className="text-green-600 text-2xl">✓</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Authorization Successful!</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                The OAuth/PAR flow completed successfully. Below you can see the received parameters and {isRealTokens ? 'real Auth0 tokens' : 'mock responses'}.
              </p>
              {isRealTokens && (
                <div className="mt-4 inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Real tokens from Auth0
                </div>
              )}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* URL Parameters */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Received Parameters</h3>
                <p className="text-sm text-gray-600 mb-4">Parameters returned from the authorization server</p>
                <div className="space-y-3">
                  {Array.from(searchParams.entries()).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-gray-900">{key}:</span>
                        <p className="text-sm text-gray-600 break-all font-mono mt-1">{value}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(value)}
                        className="ml-2 flex-shrink-0 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Info */}
              {userInfo && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {isRealTokens ? 'Real user profile from ID token' : 'Mock user profile data (demo purposes)'}
                  </p>
                  <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    {userInfo.picture && (
                      <img
                        src={userInfo.picture}
                        alt="User avatar"
                        className="w-16 h-16 rounded-full"
                      />
                    )}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{userInfo.name}</h4>
                      <p className="text-gray-600">{userInfo.email}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(userInfo).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-gray-900">{key}:</span>
                          <p className="text-sm text-gray-600 break-all font-mono">{String(value)}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(String(value))}
                          className="ml-2 flex-shrink-0 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Copy
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tokens */}
            {tokens && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Access Tokens</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {isRealTokens ? 'Real tokens from Auth0 token exchange' : 'Mock token response (in production, this would be handled securely on your backend)'}
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(tokens).map(([key, value]) => (
                    <div key={key} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900 text-sm">{key}</span>
                        <button
                          onClick={() => copyToClipboard(String(value))}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 break-all font-mono">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ID Token Claims */}
            {idTokenClaims && isRealTokens && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ID Token Claims</h3>
                <p className="text-sm text-gray-600 mb-4">Decoded claims from the ID token JWT</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(formatTokenClaims(idTokenClaims)).map(([key, value]) => (
                    <div key={key} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900 text-sm">{key}</span>
                        <button
                          onClick={() => copyToClipboard(String(value))}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 break-all font-mono">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600">⚠</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-800 mb-2">Security Note</h3>
                  <p className="text-amber-700 leading-relaxed">
                    In a production application, the authorization code would be exchanged for tokens on your backend server
                    using your client secret. The tokens and user information shown above are mock data for demonstration purposes.
                    Never expose client secrets or handle token exchange in frontend applications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Callback