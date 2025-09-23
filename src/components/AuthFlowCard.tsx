import { useState, useEffect } from 'react'
import { getCallbackUrl, getBackendUrl } from '../utils/config'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Settings } from 'lucide-react'

interface AuthFlowCardProps {
  title: string
  description: string
  flowType: 'regular' | 'par'
  externalConfig?: SharedConfigType | null
}

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

const defaultConfig: ConfigType = {
  client_id: "your-client-id",
  audience: "your-api-audience",
  domain: "your-domain.auth0.com",
  prompt: "login"
}

const defaultPARConfig: ConfigType = {
  ...defaultConfig,
  client_secret: "your-client-secret"
}

function AuthFlowCard({ title, description, flowType, externalConfig }: AuthFlowCardProps) {

  const [config, setConfig] = useState(flowType === 'par' ? defaultPARConfig : defaultConfig)
  const [authUrl, setAuthUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [requestUri, setRequestUri] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [tempConfig, setTempConfig] = useState('')
  const [tempError, setTempError] = useState('')

  // Update config when external config is provided
  useEffect(() => {
    if (externalConfig) {
      const updatedConfig = flowType === 'par'
        ? externalConfig.par
        : externalConfig.regular
      setConfig(updatedConfig)
      setError('')
      setAuthUrl('')
      setRequestUri('')
    }
  }, [externalConfig, flowType])


  const openDialog = () => {
    setTempConfig(JSON.stringify(getDisplayConfig(), null, 2))
    setTempError('')
    setIsDialogOpen(true)
  }

  const handleDialogSave = () => {
    try {
      const parsed = JSON.parse(tempConfig)
      setConfig(parsed)
      setError('')
      setTempError('')
      setIsDialogOpen(false)
    } catch (err) {
      setTempError('Invalid JSON format')
    }
  }

  const handleDialogCancel = () => {
    setTempConfig('')
    setTempError('')
    setIsDialogOpen(false)
  }

  const generateUrl = async (type: 'regular' | 'par') => {
    // Clear any previous errors when user tries again
    setError('')
    setIsGenerating(true)

    try {
      // Use defaults if not provided in config
      // Always use our flow type prefix, regardless of config.state value
      const state = `${type}_${Math.random().toString(36).substring(2, 15)}`
      const response_type = config.response_type || "code"
      let scope = config.scope || "openid profile email"

      // Ensure scope has proper spacing (fix common issue where spaces get removed)
      if (scope && typeof scope === 'string') {
        const originalScope = scope
        // Handle common malformed scope patterns
        if (scope.includes('openid') && !scope.includes(' ')) {
          // Convert "openidprofileemail" to "openid profile email"
          scope = scope
            .replace(/^openid/, 'openid ')
            .replace(/profile/, 'profile ')
            .replace(/email/, 'email ')
            .replace(/\s+/g, ' ')
            .trim()
        }
        // Ensure minimum required scopes
        if (!scope.includes('openid')) {
          scope = 'openid ' + scope
        }
        if (originalScope !== scope) {
          console.log('🔧 Fixed malformed scope:', originalScope, '→', scope)
        }
      }

      console.log('🔵 Using scope:', scope)

      if (type === 'regular') {
        // Regular OAuth flow
        const params = new URLSearchParams({
          client_id: config.client_id,
          redirect_uri: getCallbackUrl(),
          response_type: response_type,
          scope: scope,
          audience: config.audience,
          state: state,
          prompt: config.prompt
        })

        const url = `https://${config.domain}/authorize?${params.toString()}`
        setAuthUrl(url)
      } else {
        // PAR flow - use our proxy endpoint
        const parEndpoint = `${getBackendUrl()}/api/par`

        // PAR request body - send to our proxy
        const parBody = {
          domain: config.domain,
          client_id: config.client_id,
          redirect_uri: getCallbackUrl(),
          response_type: response_type,
          scope: scope, // Keep spaces for proper OAuth scope formatting
          audience: config.audience,
          state: state,
          prompt: config.prompt,
          client_secret: config.client_secret || ''
        }

        console.log('🔵 PAR Request Debug (via proxy):')
        console.log('Proxy Endpoint:', parEndpoint)
        console.log('Request Body:', parBody)

        const parResponse = await fetch(parEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(parBody)
        })

        console.log('🔵 PAR Response Debug:')
        console.log('Status:', parResponse.status)
        console.log('Headers:', Object.fromEntries(parResponse.headers.entries()))

        if (!parResponse.ok) {
          const errorText = await parResponse.text()
          console.log('🔴 PAR Error Response:', errorText)
          throw new Error(`PAR request failed: ${parResponse.status} ${errorText}`)
        }

        const parResult = await parResponse.json()
        console.log('🟢 PAR Success Response:', parResult)

        if (!parResult.request_uri) {
          console.log('🔴 PAR Error: Missing request_uri in response')
          throw new Error('PAR response missing request_uri')
        }

        console.log('✅ PAR request_uri received:', parResult.request_uri)
        setRequestUri(parResult.request_uri)

        const params = new URLSearchParams({
          client_id: config.client_id,
          request_uri: parResult.request_uri
        })

        const url = `https://${config.domain}/authorize?${params.toString()}`
        console.log('✅ Final authorization URL:', url)
        setAuthUrl(url)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate authorization URL')
    } finally {
      setIsGenerating(false)
    }
  }

  const isParFlow = flowType === 'par'

  // Function to get display config without defaults (unless explicitly set)
  const getDisplayConfig = () => {
    const { state, response_type, scope, ...configWithoutDefaults } = config
    const displayConfig: ConfigType = { ...configWithoutDefaults }

    // Only include these fields if they were explicitly set in an external config
    if (externalConfig) {
      if (state) displayConfig.state = state
      if (response_type) displayConfig.response_type = response_type
      if (scope) displayConfig.scope = scope
    }

    return displayConfig
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-xl shadow-gray-900/5 p-8 space-y-8 hover:shadow-2xl hover:shadow-gray-900/10 transition-all duration-500">
      {/* Card Header with icon */}
      <div className="relative">
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
            isParFlow ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-cyan-600'
          }`}>
            {isParFlow ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              {isParFlow && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Enhanced Security
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-1 leading-relaxed">{description}</p>
            <p className="text-xs text-gray-500 mt-2">
              {isParFlow
                ? "Requires a separate Auth0 application with PAR enabled"
                : "Requires a separate Auth0 application with PAR disabled"
              }
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Button */}
      <div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              onClick={openDialog}
              className="w-full justify-start gap-2 h-12 text-left"
            >
              <Settings className="w-4 h-4" />
              <div className="flex flex-col items-start">
                <span className="font-medium">Edit Configuration</span>
                <span className="text-xs text-gray-500">Click to modify OAuth parameters</span>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit {title} Configuration</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  JSON Configuration
                </label>
                <textarea
                  value={tempConfig}
                  onChange={(e) => setTempConfig(e.target.value)}
                  className="w-full h-64 p-4 text-sm font-mono bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Enter JSON configuration..."
                />
                {tempError && (
                  <p className="text-red-600 text-sm mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {tempError}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleDialogCancel}>
                Cancel
              </Button>
              <Button onClick={handleDialogSave}>
                Save Configuration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {error && (
          <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2">
            <p className="text-red-700 text-sm flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          </div>
        )}
      </div>

      {/* Request URI Display (PAR only) */}
      {requestUri && flowType === 'par' && (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-800">
            Request URI
          </label>
          <div className="relative p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm text-purple-800 font-mono break-all leading-relaxed">{requestUri}</p>
            </div>
          </div>
        </div>
      )}

      {/* Generated URL Display */}
      {authUrl && (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-800">
            Generated Authorization URL
          </label>
          <div className="relative p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <p className="text-sm text-green-800 font-mono break-all leading-relaxed">{authUrl}</p>
            </div>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="space-y-4">
        <button
          onClick={() => generateUrl(flowType)}
          disabled={isGenerating || Boolean(error && error.includes('Invalid JSON'))}
          className={`group relative w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform ${
            isGenerating || (error && error.includes('Invalid JSON'))
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : `${
                  isParFlow
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                } text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]`
          }`}
        >
          <span className="flex items-center justify-center space-x-2">
            {isGenerating ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span>Generate Authorization URL</span>
              </>
            )}
          </span>
        </button>

        {authUrl && (
          <button
            onClick={() => window.location.href = authUrl}
            className="group relative w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>Continue to Auth0</span>
            </span>
          </button>
        )}
      </div>

      {error && !error.includes('Invalid JSON') && (
        <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-800 text-sm leading-relaxed">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuthFlowCard