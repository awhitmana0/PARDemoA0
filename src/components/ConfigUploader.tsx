import { useState, useRef } from 'react'
import { getCallbackUrl } from '../utils/config'

interface ConfigType {
  client_id: string
  response_type: string
  scope: string
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

interface ConfigUploaderProps {
  onConfigLoad: (config: SharedConfigType) => void
}

export default function ConfigUploader({ onConfigLoad }: ConfigUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateConfig = (config: any): config is SharedConfigType => {
    const requiredFields = ['client_id', 'response_type', 'scope', 'audience', 'domain', 'prompt']

    // Check if it has regular and par properties
    if (!config.regular || !config.par) {
      return false
    }

    // Validate regular config
    const regularValid = requiredFields.every(field =>
      typeof config.regular[field] === 'string' && config.regular[field].length > 0
    )

    // Validate par config (includes client_secret requirement)
    const parValid = requiredFields.every(field =>
      typeof config.par[field] === 'string' && config.par[field].length > 0
    ) && typeof config.par.client_secret === 'string' && config.par.client_secret.length > 0

    return regularValid && parValid
  }

  const handleFileRead = (content: string) => {
    try {
      const parsed = JSON.parse(content)

      if (validateConfig(parsed)) {
        onConfigLoad(parsed)
        setUploadStatus('success')
        setErrorMessage('')
        setTimeout(() => setUploadStatus('idle'), 3000)
      } else {
        throw new Error('Invalid config structure. Expected format with "regular" and "par" objects, each containing required fields including client_secret for PAR')
      }
    } catch (error) {
      setUploadStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Invalid JSON format')
      setTimeout(() => setUploadStatus('idle'), 5000)
    }
  }

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setUploadStatus('error')
      setErrorMessage('Please select a JSON file')
      setTimeout(() => setUploadStatus('idle'), 3000)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        handleFileRead(e.target.result as string)
      }
    }
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const downloadExampleJson = () => {
    const exampleConfig = {
      regular: {
        client_id: "your-regular-client-id",
        response_type: "code",
        scope: "openid profile email",
        audience: "your-api-audience",
        domain: "your-domain.auth0.com",
        prompt: "login"
      },
      par: {
        client_id: "your-par-client-id",
        response_type: "code",
        scope: "openid profile email",
        audience: "your-api-audience",
        domain: "your-domain.auth0.com",
        prompt: "login",
        client_secret: "your-par-client-secret"
      }
    }

    const jsonString = JSON.stringify(exampleConfig, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'auth0-config-example.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const copyCallbackUrl = async () => {
    try {
      const callbackUrl = getCallbackUrl()
      await navigator.clipboard.writeText(callbackUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy callback URL:', err)
    }
  }

  return (
    <div className="mb-12">
      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Left Column - Upload */}
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Upload a JSON file to populate both OAuth and PAR flow configurations</p>

          <div
            className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 cursor-pointer ${
              isDragOver
                ? 'border-blue-400 bg-blue-50/50'
                : uploadStatus === 'success'
                ? 'border-green-400 bg-green-50/50'
                : uploadStatus === 'error'
                ? 'border-red-400 bg-red-50/50'
                : 'border-gray-300 bg-white/50 hover:border-gray-400 hover:bg-gray-50/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
          >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="text-center">
          <div className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center ${
            uploadStatus === 'success'
              ? 'bg-green-100'
              : uploadStatus === 'error'
              ? 'bg-red-100'
              : 'bg-gray-100'
          }`}>
            {uploadStatus === 'success' ? (
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : uploadStatus === 'error' ? (
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>

          {uploadStatus === 'success' ? (
            <div>
              <p className="text-lg font-medium text-green-800 mb-1">Configuration Loaded!</p>
              <p className="text-sm text-green-600">Both flow configurations have been updated</p>
            </div>
          ) : uploadStatus === 'error' ? (
            <div>
              <p className="text-lg font-medium text-red-800 mb-1">Upload Failed</p>
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-900 mb-1">
                {isDragOver ? 'Drop your JSON file here' : 'Upload Configuration File'}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Drag and drop or click to select a JSON file
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Select File
              </div>
            </div>
          )}
        </div>
        </div>
        </div>

        {/* Right Column - Callback URL */}
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Auth0 Application Configuration</p>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Required Setup</h4>
                <p className="text-sm text-blue-800 mb-3">Set your Auth0 callback URL to:</p>
                <div className="bg-white/80 rounded-lg p-3 mb-3">
                  <code className="text-sm font-mono text-gray-800 break-all">{getCallbackUrl()}</code>
                </div>
                <button
                  onClick={copyCallbackUrl}
                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    copySuccess
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                  }`}
                >
                  {copySuccess ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy URL
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Example JSON format */}
      <details className="mt-6">
        <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 mb-3">
          View example JSON format
        </summary>
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-xl p-4 text-sm font-mono text-gray-700">
            <pre>{`{
  "regular": {
    "client_id": "your-regular-client-id",
    "response_type": "code",
    "scope": "openid profile email",
    "audience": "your-api-audience",
    "domain": "your-domain.auth0.com",
    "prompt": "login"
  },
  "par": {
    "client_id": "your-par-client-id",
    "response_type": "code",
    "scope": "openid profile email",
    "audience": "your-api-audience",
    "domain": "your-domain.auth0.com",
    "prompt": "login",
    "client_secret": "your-par-client-secret"
  }
}`}</pre>
          </div>
          <button
            onClick={downloadExampleJson}
            className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m-4 4V4M6 20h12" />
            </svg>
            Download Example JSON
          </button>
        </div>
      </details>
    </div>
  )
}