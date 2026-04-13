'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Bot, Send, User, Database, Loader2, Sparkles, Zap, MessageSquare } from 'lucide-react'
import { getDatasets, getDatasetById } from '@/app/actions/dataset'

export default function AIAssistantPage() {
  const searchParams = useSearchParams()
  const datasetIdParam = searchParams.get('dataset')

  const [datasets, setDatasets] = useState<any[]>([])
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(datasetIdParam)
  const [datasetContext, setDatasetContext] = useState<any>(null)
  
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'assistant', content: 'Neural link established. I have access to your telemetry – ask anything about your business metrics.' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    async function loadDatasets() {
      const data = await getDatasets()
      setDatasets(data)
      if (!selectedDatasetId && data.length > 0) {
        setSelectedDatasetId(data[0].id)
      }
    }
    loadDatasets()
  }, [])

  useEffect(() => {
    async function loadDatasetContext() {
      if (!selectedDatasetId) return
      const data = await getDatasetById(selectedDatasetId)
      if (data) {
        const contextPayload = {
          name: data.name,
          headers: data.headers,
          data: data.data.slice(0, 5000) 
        }
        setDatasetContext(contextPayload)
      }
    }
    loadDatasetContext()
  }, [selectedDatasetId])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          datasetContext
        })
      })

      const data = await res.json()
      
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `Datalink Error: ${data.error}` }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection fragmented. Check your neural interface.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-7xl mx-auto">
      
      {/* Sidebar: Source Selection */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="glass-panel p-6 rounded-[32px] shadow-xl relative overflow-hidden group border-black/[0.03]">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <Database className="w-20 h-20 text-vivid-purple" />
          </div>
          
          <h2 className="text-xl font-heading font-black text-foreground mb-6 flex items-center gap-3 uppercase tracking-tighter">
            <Database className="w-5 h-5 text-vivid-red" />
            Sources
          </h2>
          
          {datasets.length === 0 ? (
            <p className="text-sm font-medium text-foreground/30 leading-relaxed italic">No telemetry detected. Upload a dataset to begin.</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {datasets.map(ds => (
                <button
                  key={ds.id}
                  onClick={() => setSelectedDatasetId(ds.id)}
                  className={`w-full text-left px-5 py-4 rounded-2xl border transition-all duration-300 relative overflow-hidden isolate ${
                    selectedDatasetId === ds.id 
                      ? 'border-vivid-red/40 bg-vivid-red/5 text-vivid-red shadow-sm' 
                      : 'border-black/5 hover:border-black/10 text-foreground/50 hover:bg-black/5'
                  }`}
                >
                  <p className="font-bold truncate text-xs uppercase tracking-wider">{ds.name}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel p-8 rounded-[32px] border-black/[0.02] text-sm shadow-xl">
          <h3 className="font-black text-foreground/80 mb-6 flex items-center gap-2 uppercase tracking-[0.2em] text-[10px]">
            <Zap className="w-4 h-4 text-vivid-rose" /> Neural Specs
          </h3>
          <ul className="space-y-4">
            {[
                'Pattern detection alpha',
                'Telemetry summaries',
                'Anomaly cross-linking'
            ].map((cap, idx) => (
                <li key={idx} className="flex items-center gap-3 text-foreground/40 font-bold text-[11px] uppercase tracking-wider group transition-colors hover:text-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-vivid-rose group-hover:animate-pulse"></span>
                    {cap}
                </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 glass-panel rounded-[40px] shadow-3xl flex flex-col overflow-hidden relative border-black/[0.03]">
        <div className="px-8 py-6 border-b border-black/[0.03] bg-white/50 backdrop-blur-md z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-vivid-red to-vivid-purple flex items-center justify-center text-white shadow-lg shadow-vivid-red/20 relative">
              <Bot className="w-7 h-7" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h2 className="font-heading font-black text-foreground text-lg leading-tight uppercase tracking-tighter">Neural Assistant</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black text-vivid-red uppercase tracking-[0.2em]">Live Link Operational</span>
              </div>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-black/[0.02] border border-black/5">
                <MessageSquare className="w-4 h-4 text-foreground/20" />
                <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Datalink Stream</span>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 bg-mesh custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 shadow-xl transition-transform hover:scale-110 ${
                msg.role === 'user' 
                    ? 'bg-vivid-rose text-white' 
                    : 'bg-white border border-black/5 text-vivid-red'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              </div>
              <div className={`max-w-[85%] rounded-[32px] p-6 shadow-2xl relative ${
                msg.role === 'user' 
                  ? 'bg-foreground text-white rounded-tr-none' 
                  : 'bg-white text-foreground/80 rounded-tl-none border border-black/[0.02]'
              }`}>
                {msg.content.split('\n').map((line, i) => {
                  const parts = line.split(/(\*\*.*?\*\*)/g);
                  return (
                    <p key={i} className="mb-2 last:mb-0 leading-relaxed font-medium text-sm md:text-base">
                      {parts.map((part, index) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return (
                            <strong key={index} className={`font-black tracking-tight ${msg.role === 'user' ? 'text-white' : 'text-vivid-red'}`}>
                                {part.slice(2, -2)}
                            </strong>
                          );
                        }
                        return part;
                      })}
                    </p>
                  );
                })}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-5 animate-pulse">
              <div className="w-10 h-10 rounded-2xl bg-white border border-black/5 text-vivid-red flex items-center justify-center flex-shrink-0">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <div className="bg-white border border-black/[0.02] rounded-[32px] rounded-tl-none p-6 shadow-2xl w-32 flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-vivid-red rounded-full animate-bounce [animation-duration:0.6s]"></span>
                <span className="w-2 h-2 bg-vivid-red rounded-full animate-bounce [animation-delay:0.2s] [animation-duration:0.6s]"></span>
                <span className="w-2 h-2 bg-vivid-red rounded-full animate-bounce [animation-delay:0.4s] [animation-duration:0.6s]"></span>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-white/60 backdrop-blur-xl border-t border-black/[0.03]">
          <form onSubmit={sendMessage} className="relative flex items-center group max-w-4xl mx-auto w-full">
            <div className="absolute inset-0 bg-vivid-red/5 blur-xl group-focus-within:bg-vivid-red/10 transition-all rounded-full"></div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={datasetContext ? "Query your telemetry..." : "Select a source to begin..."}
              className="w-full bg-white border border-black/[0.05] text-foreground text-sm md:text-base rounded-full focus:ring-0 focus:border-vivid-red/30 block p-5 pr-20 shadow-xl transition-all relative font-medium placeholder:text-foreground/20"
              disabled={isLoading || !datasetContext}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || !datasetContext}
              className="absolute right-3 text-white bg-foreground hover:scale-105 disabled:bg-black/10 disabled:scale-100 disabled:text-white/20 focus:outline-none font-black rounded-full text-sm p-3.5 text-center inline-flex items-center shadow-xl transition-all z-10"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          {!datasetContext && datasets.length > 0 && (
            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-foreground/20 mt-6 text-center animate-pulse tracking-widest">Awaiting source telemetry</p>
          )}
        </div>
      </div>
    </div>
  )
}
