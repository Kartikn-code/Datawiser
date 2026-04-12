import { getDatasetById } from '@/app/actions/dataset'
import DynamicCharts from '@/components/dashboard/DynamicCharts'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Database, Download, Sparkles } from 'lucide-react'
import ExportButtons from '@/components/dashboard/ExportButtons'
import DeleteDatasetButton from '@/components/dashboard/DeleteDatasetButton'

export default async function DatasetPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const dataset = await getDatasetById(resolvedParams.id)

  if (!dataset) {
    return notFound()
  }

  // Calculate simple insights for the dataset overview
  const rowCount = dataset.data.length
  const columnCount = dataset.headers.length

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
      <div className="flex items-center text-sm font-medium text-gray-500 mb-2">
        <Link href="/dashboard" className="hover:text-indigo-600 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Database className="w-8 h-8 text-indigo-500" />
            {dataset.name}
          </h1>
          <p className="mt-1 text-gray-500 flex items-center gap-2 text-sm">
            Uploaded on {new Date(dataset.created_at).toLocaleDateString()}
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            {rowCount} rows
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            {columnCount} columns
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <DeleteDatasetButton datasetId={dataset.id} />
          <ExportButtons data={dataset.data} filename={dataset.name} />
          <Link 
            href={`/dashboard/ai-assistant?dataset=${dataset.id}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-sm transition-all print:hidden"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI</span>
          </Link>
        </div>
      </div>

      {/* Render the Dynamic Charts */}
      <DynamicCharts data={dataset.data} headers={dataset.headers} />

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
