import Link from 'next/link'
import { ArrowRight, BarChart3, Database, TrendingUp, Users } from 'lucide-react'
import { getDatasets } from '@/app/actions/dataset'
import { getCustomers, getCustomerTransactions } from '@/app/actions/crm'

export default async function DashboardOverview() {
  const datasets = await getDatasets()
  const customers = await getCustomers()
  
  // Calculate aggregate CRM metrics locally without AI
  let monthlyRevenue = 0
  for (const c of customers) {
    const txs = await getCustomerTransactions(c.id)
    monthlyRevenue += txs.filter((t: any) => t.type === 'sale').reduce((acc: number, t: any) => {
      const val = Number(t.amount)
      return acc + (isNaN(val) ? 0 : val)
    }, 0)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Overview</h1>
          <p className="mt-1 text-gray-500">Welcome back. Here's what's happening with your business today.</p>
        </div>
        <Link 
          href="/dashboard/upload" 
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-sm hover:shadow-md transition-all sm:w-auto"
        >
          <Database className="w-4 h-4" />
          <span>Upload Dataset</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Total Datasets" value={datasets.length} icon={Database} prefix="" suffix="" trend="Active" color="blue" />
        <StatCard title="Local Insights" value="Ready" icon={BarChart3} prefix="" suffix="" trend="Auto" color="purple" />
        <StatCard title="Total Customers" value={customers.length} icon={Users} prefix="" suffix="" trend="Active" color="indigo" />
        <StatCard title="Total Sales" value={monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })} icon={TrendingUp} prefix="$" suffix="" trend="All Time" color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Chart Area Placeholder */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[400px] flex flex-col relative overflow-hidden">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Revenue Analytics</h2>
            <p className="text-sm text-gray-500 mb-8">Upload data or use CRM to see your analytics</p>
            
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
              <div className="w-24 h-24 mb-6 rounded-full bg-indigo-50 flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-indigo-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No Data Available</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm">
                Get started by uploading your first Excel or CSV dataset to automatically generate beautiful charts and insights.
              </p>
              <Link
                href="/dashboard/upload"
                className="mt-6 inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700"
              >
                Upload Data <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Quick Actions & AI Summary Placeholder */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                ✨
              </span>
              AI Insights
            </h2>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <p className="text-sm text-gray-600">
                  Upload your datasets, and I will analyze them to find trends, top performers, and anomalies automatically!
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/ai-assistant"
              className="mt-6 w-full flex items-center justify-center py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Open AI Assistant
            </Link>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <Users className="w-24 h-24" />
             </div>
             <h2 className="text-xl font-bold mb-2 relative z-10">Local CRM Lite</h2>
             <p className="text-gray-300 text-sm mb-6 relative z-10">
               Manage customers, track sales, and monitor credit directly from your dashboard.
             </p>
             <Link
               href="/dashboard/crm"
               className="relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors text-sm font-medium border border-white/10 text-white"
             >
               Manage Customers <ArrowRight className="w-4 h-4" />
             </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, prefix, suffix, trend, color }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  }

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">
          {prefix}{value}{suffix}
        </div>
        <div className="mt-1 flex items-center text-sm">
          <span className="text-emerald-600 font-medium">{trend}</span>
          <span className="text-gray-400 ml-2">from last month</span>
        </div>
      </div>
    </div>
  )
}
