'use client'

import React, { useState, useCallback } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { UploadCloud, FileType, CheckCircle2, AlertCircle, Loader2, Database, Sparkles, Zap } from 'lucide-react'
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
      setError('Invalid source detected. Please upload CSV or Excel telemetery.')
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
        setError('Data fragment found. The uploaded source is empty.')
        setFile(null)
        return
      }

      const cleanData = data.map(row => {
        const newRow = { ...row }
        Object.keys(newRow).forEach(key => {
          const val = newRow[key]
          if (typeof val === 'string') {
            const trimmed = val.trim()
            if (trimmed !== '' && !isNaN(Number(trimmed))) {
              newRow[key] = Number(trimmed)
            } else {
              const dateStrictRegex = /^(\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4})(T\d{2}:\d{2}:\d{2})?.*/
              if (dateStrictRegex.test(trimmed)) {
                let dateToParse = trimmed
                if (trimmed.includes('/') && !trimmed.includes('T')) {
                  const parts = trimmed.split('/')
                  if (parts.length === 3 && Number(parts[0]) > 12) {
                    dateToParse = `${parts[1]}/${parts[0]}/${parts[2]}`
                  }
                }
                const parsedDate = new Date(dateToParse)
                if (!isNaN(parsedDate.getTime())) {
                  newRow[key] = parsedDate.toISOString().split('T')[0]
                }
              }
            }
          }
        })
        return newRow
      })

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
      setError(err.message || 'System conflict. Error while parsing source.')
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
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-black/5">
        <div>
          <h1 className="text-4xl font-heading font-black tracking-tighter text-foreground uppercase">Neural <span className="text-vivid-red">Portal</span></h1>
          <p className="mt-2 text-foreground/40 font-bold uppercase tracking-widest text-[10px]">Initialize telemetry clusters</p>
        </div>
        <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-black/[0.02] border border-black/5">
            <Zap className="w-4 h-4 text-vivid-red" />
            <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Parsing: Baseline Optimal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`relative group rounded-[48px] p-2 flex items-center justify-center min-h-[450px] transition-all duration-700 isolate overflow-hidden shadow-2xl ${
                isDragging 
                    ? 'scale-[1.02]' 
                    : 'bg-white'
                }`}
            >
                {/* Visual Border Effect */}
                <div className={`absolute inset-0 bg-gradient-to-tr transition-all duration-700 -z-10 ${
                    isDragging ? 'from-vivid-red/20 via-white to-vivid-purple/20 scale-105' : 'from-black/[0.01] to-black/[0.01]'
                }`} />
                <div className={`absolute inset-0.5 rounded-[46px] bg-white -z-10 transition-all duration-700`} />
                <div className={`absolute inset-0 rounded-[48px] border-2 border-dashed transition-all duration-500 -z-10 ${
                    isDragging ? 'border-vivid-red opacity-100 animate-pulse' : 'border-black/5 opacity-30 group-hover:opacity-100'
                }`} />

                <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={onFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
                    disabled={uploading || success}
                />

                <div className="relative z-10 w-full max-w-sm mx-auto text-center px-6">
                {uploading ? (
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 mb-8 rounded-full bg-vivid-red/5 flex items-center justify-center relative">
                            <Loader2 className="w-12 h-12 text-vivid-red animate-spin font-black" />
                            <div className="absolute inset-0 rounded-full border-4 border-vivid-red/10 border-t-vivid-red animate-[spin_3s_linear_infinite]"></div>
                        </div>
                        <h3 className="text-2xl font-heading font-black text-foreground tracking-tighter mb-2 uppercase">Synthesizing Hub</h3>
                        <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] leading-loose animate-pulse">Filtering noise patterns</p>
                    </div>
                ) : success ? (
                    <div className="flex flex-col items-center animate-in zoom-in duration-700">
                        <div className="w-24 h-24 mb-8 rounded-full bg-emerald-400/10 flex items-center justify-center">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                        </div>
                        <h3 className="text-2xl font-heading font-black text-emerald-600 tracking-tighter mb-2 uppercase">Telemetry Validated</h3>
                        <p className="text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.2em] leading-loose">Redirecting to cockpit</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className={`w-24 h-24 mb-10 rounded-[32px] flex items-center justify-center transition-all duration-700 relative shadow-xl border border-black/5 ${
                            isDragging ? 'bg-vivid-red text-white scale-110 rotate-12' : 'bg-white text-foreground/20 group-hover:bg-soft-slate group-hover:scale-105'
                        }`}>
                            <UploadCloud className="w-10 h-10" />
                        </div>
                        <h3 className="text-3xl font-heading font-black text-foreground tracking-tighter mb-4 leading-tight uppercase">
                            Drop source Hub <br/>
                            or <span className="text-vivid-red opacity-80 group-hover:opacity-100 transition-opacity">Launch browse</span>
                        </h3>
                        <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] mb-12">
                            CSV / XLSX Hub Protocol
                        </p>
                        
                        <div className="flex items-center justify-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/[0.02] border border-black/5 text-[9px] font-black text-foreground/30 uppercase tracking-widest">
                                <FileType className="w-3.5 h-3.5" /> CSV Base
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/[0.02] border border-black/5 text-[9px] font-black text-foreground/30 uppercase tracking-widest">
                                <FileType className="w-3.5 h-3.5" /> Excel Cluster
                            </div>
                        </div>
                    </div>
                )}
                </div>
            </div>
        </div>

        <div className="space-y-6">
            <div className="glass-panel p-8 rounded-[40px] border-black/[0.02] relative overflow-hidden shadow-xl bg-white group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Sparkles className="w-20 h-20 text-vivid-purple" />
                </div>
                <h3 className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] mb-6">Neural Protocol</h3>
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-xl bg-vivid-red/10 text-vivid-red flex items-center justify-center shrink-0">
                            <Database className="w-4 h-4" />
                        </div>
                        <p className="text-[12px] font-bold text-foreground/40 leading-relaxed italic">"Our engine identifies currency, periods and categorical groups automatically."</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-xl bg-vivid-purple/10 text-vivid-purple flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <p className="text-[12px] font-bold text-foreground/40 leading-relaxed italic">"Neural profiling removes duplicates and fixes malformed fragments instantly."</p>
                    </div>
                </div>
            </div>

            <div className="glass-panel p-8 rounded-[40px] border-black/[0.02] bg-soft-slate shadow-xl">
                <h3 className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] mb-6">Security Baseline</h3>
                <ul className="space-y-5">
                    {[
                        'End-to-End Encryption',
                        'Zero-Training Policy',
                        'Heuristic Isolation'
                    ].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-foreground/30 font-black text-[10px] uppercase tracking-widest">
                            <div className="w-1.5 h-1.5 rounded-full bg-vivid-red"></div>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      </div>

      {error && (
        <div className="p-6 rounded-[32px] glass-panel border-vivid-rose/30 bg-vivid-rose/5 flex gap-6 text-vivid-rose animate-in slide-in-from-top-4 duration-500 shadow-xl items-center">
          <AlertCircle className="w-8 h-8 flex-shrink-0" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-1 opacity-50">Heuristic Error</p>
            <p className="text-base font-black tracking-tight">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
