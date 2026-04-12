'use client'

import { useState, useCallback } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { UploadCloud, FileType, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { uploadDataset } from '@/app/actions/dataset'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const processFile = async (selectedFile: File) => {
    setError(null)
    setFile(selectedFile)

    const isCSV = selectedFile.name.endsWith('.csv')
    const isExcel = selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')

    if (!isCSV && !isExcel) {
      setError('Please upload a valid CSV or Excel file.')
      setFile(null)
      return
    }

    try {
      let data: any[] = []
      let headers: string[] = []

      if (isCSV) {
        data = await new Promise((resolve, reject) => {
          Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data),
            error: (err) => reject(err),
          })
        })
        if (data.length > 0) {
          headers = Object.keys(data[0])
        }
      } else if (isExcel) {
        const buffer = await selectedFile.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        data = XLSX.utils.sheet_to_json(sheet)
        if (data.length > 0) {
          headers = Object.keys(data[0])
        }
      }

      if (data.length === 0) {
        setError('The uploaded file is empty.')
        setFile(null)
        return
      }

      // Clean and parse numbers/dates automatically
      const cleanData = data.map(row => {
        const newRow = { ...row }
        Object.keys(newRow).forEach(key => {
          const val = newRow[key]
          if (typeof val === 'string') {
            const trimmed = val.trim()
            // 1. Try Number parsing
            if (trimmed !== '' && !isNaN(Number(trimmed))) {
              newRow[key] = Number(trimmed)
            } else {
              // 2. Try Date parsing (simple regex match to avoid accidentally turning normal strings into dates)
              // Matches standard formats like 2023-12-01, 12/31/2023, 31-12-2023
              const dateStrictRegex = /^(\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4})(T\d{2}:\d{2}:\d{2})?.*/
              if (dateStrictRegex.test(trimmed)) {
                let dateToParse = trimmed
                // Correct DD/MM/YYYY formats which JS naturally rejects
                if (trimmed.includes('/') && !trimmed.includes('T')) {
                  const parts = trimmed.split('/')
                  if (parts.length === 3 && Number(parts[0]) > 12) {
                    dateToParse = `${parts[1]}/${parts[0]}/${parts[2]}`
                  }
                }
                const parsedDate = new Date(dateToParse)
                if (!isNaN(parsedDate.getTime())) {
                  // Ensure we format robustly instead of locale strings which can break Recharts
                  newRow[key] = parsedDate.toISOString().split('T')[0]
                }
              }
            }
          }
        })
        return newRow
      })

      // Automatically strip very large datasets to a reasonable preview context size (first 10,000 max) to prevent payload too large errors
      const processedData = cleanData.slice(0, 10000)

      setUploading(true)
      const res = await uploadDataset(selectedFile.name, processedData, headers)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/dashboard/dataset/${res.datasetId}`)
        }, 1500)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while parsing the file.')
    } finally {
      setUploading(false)
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }, [])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Upload Dataset</h1>
        <p className="mt-1 text-gray-500">Upload your CSV or Excel files to automatically generate analytics and insights.</p>
      </div>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[400px] transition-all duration-300 ${
          isDragging 
            ? 'border-indigo-500 bg-indigo-50/50 shadow-xl shadow-indigo-100' 
            : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50/50'
        } ${success ? 'border-emerald-500 bg-emerald-50' : ''}`}
      >
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={onFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          disabled={uploading || success}
        />

        {uploading ? (
          <div className="flex flex-col items-center text-indigo-600">
            <Loader2 className="w-16 h-16 animate-spin mb-4" />
            <h3 className="text-xl font-semibold">Processing Data...</h3>
            <p className="mt-2 text-sm text-indigo-400">Parsing and securely storing your dataset</p>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center text-emerald-600 animate-in zoom-in duration-500">
            <CheckCircle2 className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-semibold">Upload Complete!</h3>
            <p className="mt-2 text-sm text-emerald-500">Redirecting to your new dashboard...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className={`p-4 rounded-full mb-4 ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
              <UploadCloud className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Drop your file here, or <span className="text-indigo-600">click to browse</span>
            </h3>
            <p className="mt-2 text-sm text-gray-500 mb-6">
              Supports .csv, .xlsx, and .xls (Max 10,000 rows preview)
            </p>
            <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
              <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                <FileType className="w-4 h-4" /> CSV
              </span>
              <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                <FileType className="w-4 h-4" /> Excel
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex gap-3 text-red-600 animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
    </div>
  )
}
