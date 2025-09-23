export default async function handler(req, res) {
  console.log('🔵 Token Exchange API called with method:', req.method)
  console.log('🔵 Request headers:', req.headers)

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔵 Handling OPTIONS request')
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    console.log('🔴 Method not allowed:', req.method)
    return res.status(405).json({
      error: 'Method not allowed',
      method: req.method,
      timestamp: new Date().toISOString()
    })
  }

  try {
    console.log('🔵 Token Exchange Request received:', req.body)

    const { domain, client_id, client_secret, code, redirect_uri } = req.body

    if (!domain || !client_id || !code || !redirect_uri) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['domain', 'client_id', 'code', 'redirect_uri']
      })
    }

    // Construct Auth0 token endpoint
    const auth0TokenEndpoint = `https://${domain}/oauth/token`

    // Prepare token exchange request
    const tokenRequestBody = {
      grant_type: 'authorization_code',
      client_id: client_id,
      code: code,
      redirect_uri: redirect_uri
    }

    // Add client_secret if provided (for confidential clients)
    if (client_secret) {
      tokenRequestBody.client_secret = client_secret
    }

    console.log('🔵 Exchanging code for tokens at:', auth0TokenEndpoint)
    console.log('🔵 Token request body:', { ...tokenRequestBody, client_secret: client_secret ? '[REDACTED]' : undefined })

    // Make request to Auth0
    const response = await fetch(auth0TokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokenRequestBody)
    })

    console.log('🔵 Auth0 Token Response Status:', response.status)

    const responseText = await response.text()
    console.log('🔵 Auth0 Token Response Body:', responseText)

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Token exchange failed',
        details: responseText,
        status: response.status
      })
    }

    // Try to parse as JSON
    let tokenData
    try {
      tokenData = JSON.parse(responseText)
    } catch (e) {
      return res.status(500).json({
        error: 'Invalid JSON response from Auth0',
        details: responseText
      })
    }

    console.log('✅ Token Exchange Success:', {
      ...tokenData,
      access_token: tokenData.access_token ? '[REDACTED]' : undefined,
      id_token: tokenData.id_token ? '[REDACTED]' : undefined
    })

    res.json(tokenData)

  } catch (error) {
    console.error('❌ Token Exchange Error:', error)
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    })
  }
}