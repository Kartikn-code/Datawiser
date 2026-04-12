'use client'

import { Download, FileText } from 'lucide-react'
import Papa from 'papaparse'

export default function ExportButtons({ data, filename }: { data: any[], filename: string }) {
  
  const handleExportCSV = () => {
    const csv = Papa.unparse(data)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${filename}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrintPDF = () => {
    window.print()
  }

  return (
    <div className="flex items-center gap-3">
      <button 
        onClick={handleExportCSV}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm bg-white"
      >
        <Download className="w-4 h-4 text-gray-500" />
        <span>CSV</span>
      </button>
      <button 
        onClick={handlePrintPDF}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm bg-white print:hidden"
      >
        <FileText className="w-4 h-4 text-gray-500" />
        <span>PDF</span>
      </button>
    </div>
  )
}
