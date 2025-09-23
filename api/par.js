export default async function handler(req, res) {
  console.log('🔵 API Function called with method:', req.method)
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
    console.log('🔵 PAR Proxy Request received:', req.body)

    const { domain, ...parParams } = req.body

    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' })
    }

    // Construct Auth0 PAR endpoint
    const auth0ParEndpoint = `https://${domain}/oauth/par`

    // Prepare form data
    const formData = new URLSearchParams()
    Object.entries(parParams).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value)
      }
    })

    console.log('🔵 Proxying to Auth0:', auth0ParEndpoint)
    console.log('🔵 Form data:', formData.toString())

    // Make request to Auth0
    const response = await fetch(auth0ParEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    })

    console.log('🔵 Auth0 Response Status:', response.status)

    const responseText = await response.text()
    console.log('🔵 Auth0 Response Body:', responseText)

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'PAR request failed',
        details: responseText,
        status: response.status
      })
    }

    // Try to parse as JSON
    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      return res.status(500).json({
        error: 'Invalid JSON response from Auth0',
        details: responseText
      })
    }

    console.log('✅ PAR Success:', responseData)
    res.json(responseData)

  } catch (error) {
    console.error('❌ PAR Proxy Error:', error)
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    })
  }
}