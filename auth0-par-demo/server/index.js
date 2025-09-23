import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3001

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true
}))

// Parse JSON and URL-encoded bodies
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// PAR proxy endpoint
app.post('/api/par', async (req, res) => {
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
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`🚀 PAR Proxy Server running on http://localhost:${PORT}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
})