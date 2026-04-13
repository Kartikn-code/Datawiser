import Link from 'next/link'
import { ArrowRight, BarChart3, Database, TrendingUp, Users, Sparkles, Zap } from 'lucide-react'
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
          <h1 className="text-4xl font-heading font-black tracking-tighter text-foreground">Ecosystem <span className="text-vivid-red">Clarity</span></h1>
          <p className="mt-2 text-foreground/40 font-bold uppercase tracking-widest text-[10px]">Live business intelligence feed</p>
        </div>
        <Link 
          href="/dashboard/upload" 
          className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-black text-white bg-foreground hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
        >
          <Database className="w-4 h-4" />
          <span>Upload Dataset</span>
        </Link>
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
          {/* Main Chart Area */}
          <div className="glass-panel rounded-[40px] p-10 min-h-[450px] flex flex-col relative overflow-hidden group border-black/[0.03] shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <BarChart3 className="w-48 h-48 text-vivid-purple" />
            </div>
            
            <div className="relative z-10">
                <h2 className="text-2xl font-heading font-black text-foreground mb-2">Revenue Velocity</h2>
                <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] mb-12">Comparative growth analytics</p>
                
                <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                    <div className="w-24 h-24 mb-8 rounded-[32px] bg-black/[0.02] flex items-center justify-center border border-black/5 group-hover:border-vivid-red/30 transition-colors">
                        <BarChart3 className="w-10 h-10 text-vivid-red" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3 tracking-tight">Intelligence Awaiting Input</h3>
                    <p className="text-sm font-medium text-foreground/40 max-w-sm mb-10 leading-relaxed">
                        The analytics engine is primed. Upload a fresh dataset to visualize the heartbeat of your business.
                    </p>
                    <Link
                        href="/dashboard/upload"
                        className="inline-flex items-center gap-3 text-vivid-red font-black text-xs uppercase tracking-[0.2em] hover:gap-5 transition-all"
                    >
                        Initialize Upload <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
            
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-vivid-red/5 rounded-full blur-[80px] pointer-events-none opacity-40"></div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Quick AI Insights */}
          <div className="glass-panel rounded-[40px] p-8 relative overflow-hidden shadow-xl border-black/[0.03]">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-vivid-red to-vivid-purple flex items-center justify-center shadow-lg shadow-vivid-red/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-heading font-black text-foreground leading-none uppercase tracking-tighter">AI Pulse</h2>
                <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest mt-1">Real-time heuristics</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-soft-slate border border-black/[0.03] relative overflow-hidden group">
                <p className="text-sm font-medium text-foreground/60 leading-relaxed relative z-10 italic">
                  "Ready to cross-reference customer behavior with your latest sales export. Let's find your hidden champions."
                </p>
              </div>
              
              <Link
                href="/dashboard/ai-assistant"
                className="w-full flex items-center justify-between py-4 px-6 rounded-2xl bg-white border border-black/[0.05] text-sm font-black text-foreground hover:bg-soft-slate transition-all shadow-sm"
              >
                <span>Activate Assistant</span>
                <ArrowRight className="w-4 h-4 text-vivid-red" />
              </Link>
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
