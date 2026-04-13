import Link from 'next/link'
import { ArrowRight, BarChart3, Database, TrendingUp, Users, Sparkles, Zap, Clock, Plus, LayoutGrid } from 'lucide-react'
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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-black/5">
        <div>
          <h1 className="text-4xl font-heading font-black tracking-tighter text-foreground">Analytics <span className="text-vivid-red">Cockpit</span></h1>
          <p className="mt-2 text-foreground/40 font-bold uppercase tracking-widest text-[10px]">Command center for your data ecosystem</p>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/upload" 
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-black text-white bg-foreground hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
          >
            <Plus className="w-4 h-4" />
            <span>New Dataset</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Datasets" value={datasets.length} icon={Database} trend="+2.4%" color="red" />
        <StatCard title="AI Readiness" value="Optimal" icon={Sparkles} trend="Live" color="purple" />
        <StatCard title="Customers" value={customers.length} icon={Users} trend="Growing" color="deep-purple" />
        <StatCard title="Total Revenue" value={monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })} icon={TrendingUp} trend="Direct" color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Datasets Selection */}
          <div className="glass-panel rounded-[40px] p-10 min-h-[450px] flex flex-col relative overflow-hidden border-black/[0.03] shadow-2xl">
            <div className="relative z-10 w-full">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-heading font-black text-foreground mb-2">Available Datasets</h2>
                  <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">Select a source for deep analytics</p>
                </div>
                <Database className="w-8 h-8 text-vivid-red/20" />
              </div>
              
              {datasets.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                  <div className="w-20 h-20 mb-6 rounded-3xl bg-black/[0.02] flex items-center justify-center border border-black/5">
                    <Database className="w-10 h-10 text-vivid-red" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">No datasets found</h3>
                  <p className="text-sm font-medium text-foreground/40 max-w-sm mb-10 leading-relaxed">
                    Start by uploading a CSV or Excel file to begin your reporting journey.
                  </p>
                  <Link
                    href="/dashboard/upload"
                    className="inline-flex items-center gap-3 text-vivid-red font-black text-xs uppercase tracking-[0.2em] hover:gap-5 transition-all"
                  >
                    Initialize First Upload <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {datasets.map((ds: any) => (
                    <Link 
                      key={ds.id} 
                      href={`/dashboard/dataset/${ds.id}`}
                      className="group p-6 rounded-3xl bg-white border border-black/[0.03] hover:border-vivid-red/30 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-vivid-red/10 flex items-center justify-center text-vivid-red">
                          <Database className="w-5 h-5" />
                        </div>
                        <div className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {new Date(ds.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-foreground group-hover:text-vivid-red transition-colors truncate">
                        {ds.name}
                      </h3>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-[10px] font-black text-foreground/40 uppercase tracking-tighter">Enter Analytics</span>
                        <ArrowRight className="w-4 h-4 text-vivid-red opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-vivid-red/5 rounded-full blur-[80px] pointer-events-none opacity-40"></div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Dashboard Builder Mode Placeholder */}
          <div className="glass-panel rounded-[40px] p-8 relative overflow-hidden shadow-xl border-black/[0.03] bg-gradient-to-br from-white to-soft-slate">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center shadow-lg shadow-black/20">
                <LayoutGrid className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-heading font-black text-foreground leading-none uppercase tracking-tighter">Storyboards</h2>
                <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest mt-1">Custom Dashboards</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-black/[0.02] border border-black/[0.03] relative overflow-hidden group">
                <p className="text-sm font-medium text-foreground/60 leading-relaxed relative z-10 italic">
                  "Pin your favorite charts and insights here to build a personalized business storyboard."
                </p>
              </div>
              
              <div className="p-4 rounded-2xl bg-white border border-black/[0.05] text-[10px] font-black text-foreground/30 uppercase tracking-widest text-center shadow-sm">
                Dashboard Builder Active (Module 4)
              </div>
            </div>
          </div>

          <div className="rounded-[40px] p-8 bg-gradient-to-br from-soft-slate to-white border border-black/[0.03] relative overflow-hidden group shadow-xl">
             <div className="absolute -top-12 -right-12 p-4 opacity-[0.03] group-hover:opacity-5 transition-opacity">
               <Users className="w-48 h-48 text-electric-purple" />
             </div>
             
             <h2 className="text-xl font-heading font-black text-foreground mb-2 relative z-10">Sales Ecosystem</h2>
             <p className="text-foreground/40 text-sm font-medium mb-10 relative z-10 leading-relaxed uppercase tracking-tighter">
               Manage customers and monitor credit limits with high-fidelity tracking.
             </p>
             
             <Link
               href="/dashboard/crm"
               className="relative z-10 inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-foreground text-white hover:scale-105 transition-all text-xs font-black shadow-xl"
             >
               Enter CRM <ArrowRight className="w-4 h-4" />
             </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, trend, color }: any) {
  const themes: Record<string, any> = {
    red: { 
        bg: 'bg-vivid-red/10', 
        text: 'text-vivid-red',
        border: 'border-vivid-red/10'
    },
    purple: { 
        bg: 'bg-vivid-purple/10', 
        text: 'text-vivid-purple',
        border: 'border-vivid-purple/10'
    },
    'deep-purple': { 
        bg: 'bg-electric-purple/10', 
        text: 'text-electric-purple',
        border: 'border-electric-purple/10'
    },
    rose: { 
        bg: 'bg-vivid-rose/10', 
        text: 'text-vivid-rose',
        border: 'border-vivid-rose/10'
    },
  }

  const theme = themes[color] || themes.red

  return (
    <div className="glass-panel p-6 rounded-[32px] border-black/[0.02] shadow-xl hover:scale-[1.02] transition-all duration-500 group">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-black tracking-[0.2em] text-foreground/20 uppercase">{title}</h3>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${theme.bg} ${theme.text} group-hover:scale-110 shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div>
        <div className="text-3xl font-heading font-black text-foreground tracking-tighter">
          {value}
        </div>
        <div className={`mt-2 flex items-center text-[11px] font-black uppercase tracking-widest ${theme.text}`}>
          <Zap className="w-3 h-3 mr-1.5 animate-pulse" />
          {trend}
        </div>
      </div>
    </div>
  )
}

