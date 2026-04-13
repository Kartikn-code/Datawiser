import Link from 'next/link'
import { ArrowRight, Database, BarChart3, Clock, Search, Filter } from 'lucide-react'
import { getDatasets } from '@/app/actions/dataset'

export default async function AnalyticsPage() {
  const datasets = await getDatasets()

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="border-b border-black/5 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-heading font-black tracking-tighter text-foreground">Advanced <span className="text-vivid-purple">Analytics</span></h1>
          <p className="mt-2 text-foreground/40 font-bold uppercase tracking-widest text-[10px]">Deep-dive biological and business data analysis</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-hover:text-vivid-purple transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search datasets..." 
                    className="pl-12 pr-6 py-3 rounded-2xl bg-black/[0.02] border border-black/5 text-sm font-medium outline-none focus:border-vivid-purple/30 focus:ring-4 focus:ring-vivid-purple/5 transition-all w-full md:w-64"
                />
            </div>
            <button className="p-3 rounded-2xl bg-black/[0.02] border border-black/5 hover:bg-black/5 transition-colors">
                <Filter className="w-5 h-5 text-foreground/40" />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {datasets.length === 0 ? (
          <div className="col-span-full py-24 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-[40px] bg-soft-slate flex items-center justify-center mb-8 border border-black/5">
                <Database className="w-10 h-10 text-foreground/20" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">No data sources detected</h2>
            <p className="text-sm font-medium text-foreground/40 max-w-sm mb-10 leading-relaxed uppercase tracking-tighter">
              The analytical environment is sterile. Ingest a dataset to begin the breakdown.
            </p>
            <Link 
              href="/dashboard/upload"
              className="px-10 py-4 rounded-3xl bg-foreground text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              Initialize Upload
            </Link>
          </div>
        ) : (
          datasets.map((ds: any) => (
            <Link 
              key={ds.id} 
              href={`/dashboard/dataset/${ds.id}`}
              className="group glass-panel p-8 rounded-[40px] border-black/[0.02] hover:border-vivid-purple/30 hover:scale-[1.02] transition-all duration-500 shadow-xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-vivid-purple to-electric-purple flex items-center justify-center shadow-lg shadow-vivid-purple/20">
                    <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] flex items-center gap-1.5 bg-black/5 px-3 py-1.5 rounded-full">
                    <Clock className="w-3 h-3" />
                    {new Date(ds.created_at).toLocaleDateString()}
                </div>
              </div>
              
              <h3 className="text-xl font-heading font-black text-foreground mb-4 group-hover:text-vivid-purple transition-colors truncate">
                {ds.name}
              </h3>
              
              <div className="pt-6 border-t border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-vivid-purple animate-pulse"></div>
                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest leading-none">Ready for Extraction</span>
                </div>
                <ArrowRight className="w-5 h-5 text-vivid-purple translate-x-0 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
