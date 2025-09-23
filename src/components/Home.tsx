import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthFlowCard from './AuthFlowCard'
import ConfigUploader from './ConfigUploader'
import { saveConfigToCookies, loadConfigFromCookies, clearConfigFromCookies, hasConfigInCookies } from '../utils/cookies'
import { getAuthSession, clearAuthSession, isAuthenticated } from '../utils/auth'

interface ConfigType {
  client_id: string
  response_type?: string
  scope?: string
  audience: string
  state?: string
  domain: string
  prompt: string
  client_secret?: string
}

interface SharedConfigType {
  regular: ConfigType
  par: ConfigType
}

export default function HomePage() {
  const navigate = useNavigate()
  const [sharedConfig, setSharedConfig] = useState<SharedConfigType | null>(null)
  const [hasCookies, setHasCookies] = useState(false)
  const [authSession, setAuthSession] = useState<any>(null)
  const [userAuthenticated, setUserAuthenticated] = useState(false)

  // Load config from cookies and check authentication on mount
  useEffect(() => {
    const savedConfig = loadConfigFromCookies()
    if (savedConfig) {
      setSharedConfig(savedConfig)
      setHasCookies(true)
    } else {
      setHasCookies(hasConfigInCookies())
    }

    // Check for existing authentication session
    const session = getAuthSession()
    if (session) {
      setAuthSession(session)
      setUserAuthenticated(true)
    }
  }, [])

  const handleConfigLoad = (config: SharedConfigType) => {
    setSharedConfig(config)
    saveConfigToCookies(config)
    setHasCookies(true)
  }

  const handleClearCookies = () => {
    clearConfigFromCookies()
    setHasCookies(false)
    setSharedConfig(null)
    window.location.reload()
  }

  const handleLogout = () => {
    clearAuthSession()
    setAuthSession(null)
    setUserAuthenticated(false)
  }

  const goToAuthenticated = () => {
    navigate('/authenticated')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Modern Header with gradient */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                PAR Demo
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-3">
              {userAuthenticated && authSession && (
                <>
                  {/* User Info */}
                  <div className="flex items-center space-x-3 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
                    {authSession.userInfo?.picture && (
                      <img
                        src={authSession.userInfo.picture}
                        alt="User avatar"
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-green-800">
                        {authSession.userInfo?.name || authSession.userInfo?.email || 'User'}
                      </span>
                      <span className="text-xs text-green-600">
                        Authenticated via {authSession.flowType}
                      </span>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={goToAuthenticated}
                    className="inline-flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 rounded-xl px-4 py-2 text-sm font-medium text-blue-700 hover:text-blue-800 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View Details</span>
                  </button>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center space-x-2 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-xl px-4 py-2 text-sm font-medium text-red-700 hover:text-red-800 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </>
              )}

              {hasCookies && (
                <button
                  onClick={handleClearCookies}
                  className="inline-flex items-center space-x-2 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-xl px-4 py-2 text-sm font-medium text-red-700 hover:text-red-800 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Clear Saved Config</span>
                </button>
              )}
              <a
                href="https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow/authorization-code-flow-with-par"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-white/80 hover:bg-white/90 border border-gray-200 hover:border-blue-300 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-700 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>View Documentation</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Compare OAuth and PAR authentication flows
          </h2>
        </div>

        {/* Configuration Upload Section */}
        <ConfigUploader onConfigLoad={handleConfigLoad} />

        {/* Two Column Layout with enhanced styling */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column - Regular OAuth */}
          <div className="transform hover:scale-[1.02] transition-transform duration-300">
            <AuthFlowCard
              title="Manual OAuth Flow"
              description="Standard authorization code flow with URL parameters"
              flowType="regular"
              externalConfig={sharedConfig}
            />
          </div>

          {/* Right Column - PAR Flow */}
          <div className="transform hover:scale-[1.02] transition-transform duration-300">
            <AuthFlowCard
              title="Manual PAR Flow"
              description="Enhanced security with Pushed Authorization Requests"
              flowType="par"
              externalConfig={sharedConfig}
            />
          </div>
        </div>

        {/* PAR Benefits Section */}
        <div className="mt-16 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Why Choose PAR?</h3>
            <p className="text-gray-600">Pushed Authorization Requests provide enhanced security benefits</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <a
              href="https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow/authorization-code-flow-with-par"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02]"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-purple-900 mb-2 group-hover:text-purple-700">Enhanced Security</h4>
              <p className="text-purple-700 text-sm leading-relaxed">Authorization parameters are sent via secure backchannel, reducing exposure in browser history and logs</p>
              <div className="flex items-center mt-3 text-purple-600 text-sm font-medium">
                <span>Learn more</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>

            <a
              href="https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow/authorization-code-flow-with-par"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02]"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-emerald-900 mb-2 group-hover:text-emerald-700">Reduced URL Length</h4>
              <p className="text-emerald-700 text-sm leading-relaxed">Short, clean authorization URLs improve user experience and prevent URL length limitations</p>
              <div className="flex items-center mt-3 text-emerald-600 text-sm font-medium">
                <span>Learn more</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>

            <a
              href="https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow/authorization-code-flow-with-par"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02]"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-blue-900 mb-2 group-hover:text-blue-700">OAuth 2.1 Ready</h4>
              <p className="text-blue-700 text-sm leading-relaxed">Future-proof implementation aligned with OAuth 2.1 security best practices and FAPI compliance</p>
              <div className="flex items-center mt-3 text-blue-600 text-sm font-medium">
                <span>Learn more</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>
          </div>
        </div>

        {/* Disclaimer Section */}
        <div className="mt-12 bg-amber-50/60 backdrop-blur-sm rounded-2xl border border-amber-200 p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-900 mb-2">Important Notice</h4>
              <p className="text-sm text-amber-800 leading-relaxed">
                <strong>Public applications are not currently supported</strong> in production PAR implementations as they cannot securely store client credentials.
                This demo uses public client authentication for demonstration purposes only. In production, PAR should be used with
                <strong> confidential clients</strong> that can securely authenticate with client credentials.
              </p>
              <a
                href="https://auth0.com/docs/get-started/applications/application-types"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-2 text-sm font-medium text-amber-700 hover:text-amber-600 transition-colors"
              >
                Learn about application types
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}