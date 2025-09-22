import AuthFlowCard from './AuthFlowCard'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Auth0 Flow Demo</h1>
        </div>
      </header>

      {/* Two Column Layout */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Regular OAuth */}
          <AuthFlowCard
            title="Regular OAuth Flow"
            description="Standard authorization code flow"
            flowType="regular"
          />

          {/* Right Column - PAR Flow */}
          <AuthFlowCard
            title="PAR Flow"
            description="Pushed Authorization Request"
            flowType="par"
          />
        </div>
      </main>
    </div>
  )
}