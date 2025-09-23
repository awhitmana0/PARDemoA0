import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuthSession, clearAuthSession } from '../utils/auth'
import { formatTokenClaims } from '../utils/jwt'

interface AuthSession {
  tokens: {
    access_token?: string
    id_token?: string
    token_type?: string
    expires_in?: number
    scope?: string
  }
  userInfo: {
    sub?: string
    name?: string
    email?: string
    picture?: string
    [key: string]: any
  } | null
  idTokenClaims: any
  flowType: string
  timestamp: number
  expiresAt?: number
}

const Authenticated = () => {
  const navigate = useNavigate()
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const authSession = getAuthSession()
    if (!authSession) {
      navigate('/')
      return
    }
    setSession(authSession)
    setLoading(false)
  }, [navigate])

  const handleLogout = () => {
    clearAuthSession()
    navigate('/')
  }

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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Authentication Details</h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const { tokens, userInfo, idTokenClaims, flowType } = session

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-100">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Authentication Details
              </h1>
              <p className="text-gray-600 mt-1">Authenticated via {flowType} flow</p>
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
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout & Clear Session
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Success Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <span className="text-green-600 text-2xl">✓</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Successfully Authenticated!</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              You have been authenticated using the {flowType} flow. Below you can see your tokens and user information.
            </p>
            <div className="mt-4 inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Real tokens from Auth0
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* User Info */}
            {userInfo && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
                <p className="text-sm text-gray-600 mb-4">Real user profile from ID token</p>
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

            {/* Session Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Information</h3>
              <p className="text-sm text-gray-600 mb-4">Authentication session details</p>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <span className="font-medium text-gray-900">Flow Type:</span>
                  <p className="text-sm text-gray-600">{flowType}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <span className="font-medium text-gray-900">Authenticated At:</span>
                  <p className="text-sm text-gray-600 font-mono">
                    {new Date(session.timestamp).toLocaleString()}
                  </p>
                </div>
                {session.expiresAt && (
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <span className="font-medium text-gray-900">Expires At:</span>
                    <p className="text-sm text-gray-600 font-mono">
                      {new Date(session.expiresAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tokens */}
          {tokens && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Access Tokens</h3>
              <p className="text-sm text-gray-600 mb-4">Real tokens from Auth0 token exchange</p>
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
          {idTokenClaims && (
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
                  In a production application, tokens would be handled more securely and typically stored in httpOnly cookies.
                  This demo stores tokens in localStorage for demonstration purposes. The authentication session will persist
                  until you explicitly logout or the tokens expire.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Authenticated