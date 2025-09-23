import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'
import { useState, useEffect } from 'react'
import { loadConfigFromCookies } from './utils/cookies'
import Home from './components/Home'
import Callback from './components/Callback'

function App() {
  const [auth0Config, setAuth0Config] = useState({
    domain: 'demo-tenant.auth0.com',
    clientId: 'demo-client-id'
  })

  useEffect(() => {
    const savedConfig = loadConfigFromCookies()
    if (savedConfig?.regular) {
      setAuth0Config({
        domain: savedConfig.regular.domain,
        clientId: savedConfig.regular.client_id
      })
    }
  }, [])

  return (
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={{
        redirect_uri: window.location.origin + '/callback',
        scope: 'openid profile email'
      }}
    >
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/callback" element={<Callback />} />
          </Routes>
        </div>
      </Router>
    </Auth0Provider>
  )
}

export default App
