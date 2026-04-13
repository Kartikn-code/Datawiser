import { getDatasetById } from '@/app/actions/dataset'
import AnalyticsEngine from '@/components/dashboard/AnalyticsEngine'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Database, Sparkles, LayoutPanelLeft, Clock } from 'lucide-react'
import ExportButtons from '@/components/dashboard/ExportButtons'
import DeleteDatasetButton from '@/components/dashboard/DeleteDatasetButton'

export default async function DatasetPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const dataset = await getDatasetById(resolvedParams.id)

  if (!dataset) {
    return notFound()
  }

  const rowCount = dataset.data.length
  const columnCount = dataset.headers.length

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard/analytics" 
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-vivid-purple transition-all"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          Back to Repository
        </Link>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">
            <LayoutPanelLeft className="w-4 h-4" />
            Analysis Workspace
        </div>
      </div>
      
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 pb-10 border-b border-black/5">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-vivid-purple to-electric-purple flex items-center justify-center text-white shadow-lg shadow-vivid-purple/20">
                <Database className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-heading font-black text-foreground tracking-tighter">
                {dataset.name}
            </h1>
          </div>
          <div className="mt-1 text-foreground/40 flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(dataset.created_at).toLocaleDateString()}</span>
            <span className="w-1 h-1 rounded-full bg-black/10"></span>
            <span className="flex items-center gap-1.5">{rowCount} Data Points</span>
            <span className="w-1 h-1 rounded-full bg-black/10"></span>
            <span className="flex items-center gap-1.5">{columnCount} Dimensional Nodes</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <ExportButtons data={dataset.data} filename={dataset.name} />
          <DeleteDatasetButton datasetId={dataset.id} />
          <Link 
            href={`/dashboard/ai-assistant?dataset=${dataset.id}`}
            className="inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl text-sm font-black text-white bg-vivid-purple hover:scale-105 transition-all shadow-xl shadow-vivid-purple/20 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Insights Engine</span>
          </Link>
        </div>
      </div>

      <AnalyticsEngine 
        data={dataset.data} 
        headers={dataset.headers} 
        datasetId={dataset.id}
        datasetName={dataset.name}
      />


      {/* Raw Data Preview */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Data Preview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
              <tr>
                {dataset.headers.slice(0, 10).map((header: string) => (
                  <th key={header} className="px-6 py-4 font-medium">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dataset.data.slice(0, 5).map((row: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  {dataset.headers.slice(0, 10).map((header: string) => (
                    <td key={header} className="px-6 py-4 text-gray-600 max-w-[200px] truncate">
                      {row[header]?.toString() || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-gray-50/50 text-center text-xs text-gray-500 border-t border-gray-100">
          Showing 5 of {rowCount} rows
        </div>
      </div>
    </div>
  )
}
