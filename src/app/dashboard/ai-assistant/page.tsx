'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Bot, Send, User, Database, Loader2 } from 'lucide-react'
import { getDatasets, getDatasetById } from '@/app/actions/dataset'

export default function AIAssistantPage() {
  const searchParams = useSearchParams()
  const datasetIdParam = searchParams.get('dataset')

  const [datasets, setDatasets] = useState<any[]>([])
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(datasetIdParam)
  const [datasetContext, setDatasetContext] = useState<any>(null)
  
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'assistant', content: 'Hi there! I am your AI Data Assistant. Select a dataset, and ask me anything about your business metrics.' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom when messages change
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
        // We only take the first 50 rows for context to save tokens, and because most high-level answers only need samples, or you need code execution
        const contextPayload = {
          name: data.name,
          headers: data.headers,
          data: data.data.slice(0, 50) 
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
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered a network error while connecting to the AI.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
      
      {/* Sidebar for Select Dataset */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-500" />
            Working Dataset
          </h2>
          {datasets.length === 0 ? (
            <p className="text-sm text-gray-500">No datasets uploaded yet. Upload one to start chatting!</p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {datasets.map(ds => (
                <button
                  key={ds.id}
                  onClick={() => setSelectedDatasetId(ds.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-200 ${
                    selectedDatasetId === ds.id 
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium shadow-sm' 
                      : 'border-gray-200 hover:border-indigo-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <p className="truncate">{ds.name}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 text-sm text-indigo-800">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Bot className="w-4 h-4" /> Capabilities
          </h3>
          <ul className="list-disc pl-4 space-y-1 text-indigo-700/80">
            <li>Summarize highest/lowest values</li>
            <li>Detect anomalies in data</li>
            <li>Answer specific column inquiries</li>
          </ul>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden relative">
        <div className="p-4 border-b border-gray-100 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Data Assistant</h2>
              <p className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online
              </p>
            </div>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${
                msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-indigo-600'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm text-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none'
              }`}>
                {msg.content.split('\n').map((line, i) => (
                  <p key={i} className="mb-1 last:mb-0">{line}</p>
                ))}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200 text-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm w-24 flex items-center justify-center gap-1">
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={sendMessage} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your data..."
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-full focus:ring-indigo-500 focus:border-indigo-500 block p-4 pr-16 shadow-inner transition-colors focus:bg-white"
              disabled={isLoading || !datasetContext}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || !datasetContext}
              className="absolute right-2 text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center shadow-md transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          {!datasetContext && datasets.length > 0 && (
            <p className="text-xs text-amber-500 mt-2 text-center">Please select a dataset from the sidebar to chat.</p>
          )}
        </div>
      </div>
    </div>
  )
}
