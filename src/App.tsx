import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Callback from './components/Callback'
import Authenticated from './components/Authenticated'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/authenticated" element={<Authenticated />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
