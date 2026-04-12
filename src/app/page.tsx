import Link from 'next/link'
import { ArrowRight, BarChart3, Database, MessageSquare, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[400px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <main className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            Datawiser
          </div>
          <Link 
            href="/login"
            className="px-5 py-2 rounded-full border border-gray-700 bg-gray-900/50 hover:bg-gray-800 text-sm font-medium transition-colors"
          >
            Sign In
          </Link>
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-6 pt-24 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            <span>The intelligent business OS</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl mx-auto leading-tight">
            Stop wrestling with spreadsheets. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Start making decisions.
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Upload your business data and get instant, completely automated AI-powered dashboards and insights. Designed for real businesses, not data scientists.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold text-white shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-transform hover:-translate-y-0.5"
            >
              Get Started for Free <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="px-8 py-4 rounded-full border border-gray-700 hover:bg-gray-800 font-medium text-gray-300 transition-colors"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Features Preview */}
        <div id="features" className="container mx-auto px-6 py-24 border-t border-gray-800/50">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-gray-900/50 border border-gray-800">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
                <Database className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Dashboards</h3>
              <p className="text-gray-400">
                Upload any CSV or Excel file. We automatically detect structures, aggregate data, and build stunning charts.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-gray-900/50 border border-gray-800">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Data Assistant</h3>
              <p className="text-gray-400">
                Ask questions in plain English. "Which product sold the most?" and get instant query results and charts.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-gray-900/50 border border-gray-800">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Local CRM Built-in</h3>
              <p className="text-gray-400">
                Track customers, record manual sales, and monitor credit balances without leaving your dashboard.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
