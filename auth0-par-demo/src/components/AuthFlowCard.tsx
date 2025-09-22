import { useState } from 'react'

interface AuthFlowCardProps {
  title: string
  description: string
  flowType: 'regular' | 'par'
}

interface ConfigType {
  client_id: string
  redirect_uri: string
  response_type: string
  scope: string
  audience: string
  state: string
  domain: string
  client_secret?: string
}

const defaultConfig: ConfigType = {
  client_id: "your-client-id",
  redirect_uri: "http://localhost:5173/callback",
  response_type: "code",
  scope: "openid profile email",
  audience: "your-api-audience",
  state: Math.random().toString(36).substring(7),
  domain: "your-domain.auth0.com"
}

const defaultPARConfig: ConfigType = {
  ...defaultConfig,
  client_secret: "your-client-secret"
}

function AuthFlowCard({ title, description, flowType }: AuthFlowCardProps) {
  const [config, setConfig] = useState(flowType === 'par' ? defaultPARConfig : defaultConfig)
  const [authUrl, setAuthUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [requestUri, setRequestUri] = useState('')

  const handleConfigChange = (value: string) => {
    try {
      const parsed = JSON.parse(value)
      setConfig(parsed)
      setError('')
    } catch (err) {
      setError('Invalid JSON format')
    }
  }

  const generateUrl = async (type: 'regular' | 'par') => {
    if (error) return

    setIsGenerating(true)
    setError('')

    try {
      if (type === 'regular') {
        // Regular OAuth flow
        const params = new URLSearchParams({
          client_id: config.client_id,
          redirect_uri: config.redirect_uri,
          response_type: config.response_type,
          scope: config.scope,
          audience: config.audience,
          state: config.state
        })

        const url = `https://${config.domain}/authorize?${params.toString()}`
        setAuthUrl(url)
      } else {
        // PAR flow
        const parEndpoint = `https://${config.domain}/oauth/par`

        const parBody = new URLSearchParams({
          client_id: config.client_id,
          redirect_uri: config.redirect_uri,
          response_type: config.response_type,
          scope: config.scope,
          audience: config.audience,
          state: config.state
        })

        const parHeaders: HeadersInit = {
          'Content-Type': 'application/x-www-form-urlencoded'
        }

        if (config.client_secret) {
          const credentials = btoa(`${config.client_id}:${config.client_secret}`)
          parHeaders['Authorization'] = `Basic ${credentials}`
        }

        const parResponse = await fetch(parEndpoint, {
          method: 'POST',
          headers: parHeaders,
          body: parBody
        })

        if (!parResponse.ok) {
          const errorText = await parResponse.text()
          throw new Error(`PAR request failed: ${parResponse.status} ${errorText}`)
        }

        const parResult = await parResponse.json()

        if (!parResult.request_uri) {
          throw new Error('PAR response missing request_uri')
        }

        setRequestUri(parResult.request_uri)

        const params = new URLSearchParams({
          client_id: config.client_id,
          request_uri: parResult.request_uri
        })

        const url = `https://${config.domain}/authorize?${params.toString()}`
        setAuthUrl(url)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate authorization URL')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Card Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>

      {/* JSON Config Textarea */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Configuration
        </label>
        <textarea
          value={JSON.stringify(config, null, 2)}
          onChange={(e) => handleConfigChange(e.target.value)}
          className="w-full h-40 p-3 text-sm font-mono border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Enter JSON configuration..."
        />
        {error && (
          <p className="text-red-600 text-sm mt-1">{error}</p>
        )}
      </div>

      {/* Request URI Display (PAR only) */}
      {requestUri && flowType === 'par' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Request URI
          </label>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-700 font-mono break-all">{requestUri}</p>
          </div>
        </div>
      )}

      {/* Generated URL Display */}
      {authUrl && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Generated Authorization URL
          </label>
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-xs text-green-700 font-mono break-all">{authUrl}</p>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => generateUrl(flowType)}
          disabled={isGenerating || !!error}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            isGenerating || error
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isGenerating ? 'Generating...' : 'Generate Authorization URL'}
        </button>

        {authUrl && (
          <button
            onClick={() => window.location.href = authUrl}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
          >
            Continue to Auth0
          </button>
        )}
      </div>

      {error && !error.includes('Invalid JSON') && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}

export default AuthFlowCard