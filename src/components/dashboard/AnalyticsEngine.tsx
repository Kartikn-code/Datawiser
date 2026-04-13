'use client'

import React, { useState, useMemo, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, ZAxis
} from 'recharts'
import { 
  Filter, BarChart3, Settings2, Hash, Type, Calendar, 
  ChevronDown, ChevronUp, Palette, Type as TextIcon, 
  Grid3X3, Eye, Download, Info, Plus, Trash2, Copy, 
  ArrowUpDown, Layers, MousePointer2, Sparkles, Zap, Search
} from 'lucide-react'

// Constants
const COLORS = ['#4f46e5', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#84cc16', '#a855f7']

interface AnalyticsEngineProps {
  data: any[]
  headers: string[]
  datasetId: string
  datasetName: string
  onPinToDashboard?: (config: any) => void
}

type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter'
type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max'

export default function AnalyticsEngine({ data, headers, datasetId, datasetName, onPinToDashboard }: AnalyticsEngineProps) {
  // --- STATE ---
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [xAxisKey, setXAxisKey] = useState<string>(headers[0] || '')
  const [yAxisKey, setYAxisKey] = useState<string>(headers[1] || headers[0] || '')
  const [aggregation, setAggregation] = useState<AggregationType>('sum')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [sortBy, setSortBy] = useState<'x' | 'y'>('y')
  const [pivotKey, setPivotKey] = useState<string>('') // Grouping / Pivot Mode
  
  // Customization (Module 2)
  const [chartTitle, setChartTitle] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#4f46e5')
  const [showGrid, setShowGrid] = useState(true)
  const [showLegend, setShowLegend] = useState(true)
  const [xAxisLabel, setXAxisLabel] = useState('')
  const [yAxisLabel, setYAxisLabel] = useState('')
  
  // Filters (Module 3)
  const [categoricalFilters, setCategoricalFilters] = useState<Record<string, string[]>>({})
  const [numericFilters, setNumericFilters] = useState<Record<string, [number, number]>>({})
  const [searchTerm, setSearchTerm] = useState('')
  
  // Calculated Fields (Module 7)
  const [calculatedFields, setCalculatedFields] = useState<Array<{ name: string, formula: string }>>([])
  
  // UI States
  const [showSettings, setShowSettings] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // --- PERSISTENCE (Module 5) ---
  const handlePin = useCallback(() => {
    const config = {
      id: Math.random().toString(36).substr(2, 9),
      datasetId,
      datasetName,
      chartType,
      xAxisKey,
      yAxisKey,
      aggregation,
      primaryColor,
      chartTitle,
      showGrid,
      showLegend,
      categoricalFilters,
      numericFilters,
      calculatedFields
    }
    
    const existing = JSON.parse(localStorage.getItem('datawiser_dashboard') || '[]')
    localStorage.setItem('datawiser_dashboard', JSON.stringify([...existing, config]))
    alert('Pinned to Storyboard!')
  }, [datasetId, datasetName, chartType, xAxisKey, yAxisKey, aggregation, primaryColor, chartTitle, showGrid, showLegend, categoricalFilters, numericFilters, calculatedFields])
  
  // --- HELPERS ---
  const allHeaders = useMemo(() => [...headers, ...calculatedFields.map(f => f.name)], [headers, calculatedFields])

  const getColType = useCallback((col: string) => {
    const calcField = calculatedFields.find(f => f.name === col)
    if (calcField) return 'numeric' // Currently all calc fields are treated as numeric
    
    const sample = data.find(r => r[col] !== null && r[col] !== undefined)?.[col]
    if (typeof sample === 'number') return 'numeric'
    if (typeof sample === 'string' && !isNaN(Date.parse(sample)) && isNaN(Number(sample))) return 'date'
    if (typeof sample === 'string' && !isNaN(Number(sample))) return 'numeric'
    return 'categorical'
  }, [data, calculatedFields])

  // --- DATA PROCESSING (MODULE 13: PERFORMANCE) ---
  const processedData = useMemo(() => {
    let result = data.map(row => {
        const enrichedRow = { ...row }
        calculatedFields.forEach(cf => {
            // Simple formula evaluator: replace [col] with row[col]
            // We'll use a very basic regex for safety
            let formula = cf.formula
            headers.forEach(h => {
                const val = Number(row[h]) || 0
                formula = formula.replace(new RegExp(`\\[${h}\\]`, 'g'), val.toString())
            })
            try {
                // Warning: eval is used here. In production, use a safe math parser.
                // eslint-disable-next-line no-eval
                enrichedRow[cf.name] = eval(formula)
            } catch (e) {
                enrichedRow[cf.name] = 0
            }
        })
        return enrichedRow
    })

    // Apply Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      result = result.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(lower)))
    }

    // Apply Advanced Filters (Module 3)
    Object.entries(categoricalFilters).forEach(([col, values]) => {
      if (values.length > 0) {
        result = result.filter(r => values.includes(String(r[col])))
      }
    })
    Object.entries(numericFilters).forEach(([col, [min, max]]) => {
      result = result.filter(r => {
        const val = Number(r[col])
        return val >= min && val <= max
      })
    })

    // Grouping & Aggregation
    const groups: Record<string, any[]> = {}
    result.forEach(row => {
      const key = String(row[xAxisKey] || 'Unknown')
      if (!groups[key]) groups[key] = []
      groups[key].push(row)
    })

    const aggregated = Object.entries(groups).map(([key, rows]) => {
      let value = 0
      if (aggregation === 'count') {
        value = rows.length
      } else {
        const values = rows.map(r => Number(r[yAxisKey])).filter(v => !isNaN(v))
        if (values.length > 0) {
          if (aggregation === 'sum') value = values.reduce((a, b) => a + b, 0)
          else if (aggregation === 'avg') value = values.reduce((a, b) => a + b, 0) / values.length
          else if (aggregation === 'min') value = Math.min(...values)
          else if (aggregation === 'max') value = Math.max(...values)
        }
      }

      return {
        x: key,
        y: Number(value.toFixed(2)),
        originalKey: xAxisKey,
        originalValueKey: yAxisKey
      }
    })

    // Sorting (Module 8)
    aggregated.sort((a, b) => {
      const valA = sortBy === 'x' ? a.x : a.y
      const valB = sortBy === 'x' ? b.x : b.y
      
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA
      }
      return sortOrder === 'asc' 
        ? String(valA).localeCompare(String(valB)) 
        : String(valB).localeCompare(String(valA))
    })

    return aggregated
  }, [data, xAxisKey, yAxisKey, aggregation, categoricalFilters, numericFilters, searchTerm, calculatedFields, sortBy, sortOrder, headers])

  // --- AI INSIGHTS (Module 12: Rule-based) ---
  const insights = useMemo(() => {
    if (processedData.length < 2) return []
    const items: string[] = []
    
    // 1. Max Value
    const sortedByY = [...processedData].sort((a, b) => b.y - a.y)
    items.push(`${sortedByY[0].x} leads the dataset with a ${aggregation} of ${sortedByY[0].y}.`)
    
    // 2. Trend (for Line/Area)
    if (chartType === 'line' || chartType === 'area') {
        const first = processedData[0].y
        const last = processedData[processedData.length - 1].y
        const diff = last - first
        const percent = ((diff / first) * 100).toFixed(1)
        if (diff > 0) items.push(`Overall trajectory is ascending, showing a ${percent}% growth from start to finish.`)
        else items.push(`Observed a ${Math.abs(Number(percent))}% decline across the current dimension range.`)
    }
    
    // 3. Concentration (Pareto-like)
    const total = processedData.reduce((acc, curr) => acc + curr.y, 0)
    const top3 = sortedByY.slice(0, 3).reduce((acc, curr) => acc + curr.y, 0)
    const concentration = ((top3 / total) * 100).toFixed(0)
    items.push(`The top 3 categories account for nearly ${concentration}% of the total volume.`)
    
    // 4. Outliers (Z-score like)
    const mean = total / processedData.length
    const stdDev = Math.sqrt(processedData.map(d => Math.pow(d.y - mean, 2)).reduce((a, b) => a + b, 0) / processedData.length)
    const anomalies = processedData.filter(d => Math.abs(d.y - mean) > 2 * stdDev)
    if (anomalies.length > 0) {
        items.push(`Anomalous spikes detected in: ${anomalies.map(a => a.x).join(', ')}.`)
    }

    return items
  }, [processedData, aggregation, chartType])

  // --- HANDLERS ---

  const handleDrillDown = useCallback((item: any) => {
    if (!item || !item.x) return
    const value = String(item.x)
    const current = categoricalFilters[xAxisKey] || []
    if (!current.includes(value)) {
        setCategoricalFilters({ ...categoricalFilters, [xAxisKey]: [...current, value] })
        setShowFilters(true)
    }
  }, [categoricalFilters, xAxisKey])

  // --- RENDER HELPERS ---
  const formatValue = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`
    return val.toString()
  }

  const renderChart = () => {
    const props = {
      data: processedData,
      margin: { top: 20, right: 30, left: 20, bottom: 60 }
    }

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...props}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />}
            <XAxis dataKey="x" label={{ value: xAxisLabel || xAxisKey, position: 'bottom', offset: 40 }} tick={{fontSize: 12}} angle={-45} textAnchor="end" />
            <YAxis tickFormatter={formatValue} label={{ value: yAxisLabel || yAxisKey, angle: -90, position: 'insideLeft' }} tick={{fontSize: 12}} />
            <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
            {showLegend && <Legend verticalAlign="top" height={36}/>}
            <Bar 
                dataKey="y" 
                fill={primaryColor} 
                radius={[6, 6, 0, 0]} 
                onClick={(data: any) => handleDrillDown(data)}
                style={{ cursor: 'pointer' }}
            />
          </BarChart>
        )
      case 'line':
        return (
          <LineChart {...props}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />}
            <XAxis dataKey="x" tick={{fontSize: 12}} angle={-45} textAnchor="end" />
            <YAxis tickFormatter={formatValue} tick={{fontSize: 12}} />
            <Tooltip />
            {showLegend && <Legend verticalAlign="top" height={36}/>}
            <Line 
                type="monotone" 
                dataKey="y" 
                stroke={primaryColor} 
                strokeWidth={3} 
                dot={{ r: 4, fill: primaryColor, cursor: 'pointer' }} 
                activeDot={{ r: 8, onClick: (_, data: any) => handleDrillDown(data.payload) }}
            />
          </LineChart>
        )
      case 'area':
        return (
          <AreaChart {...props}>
            <defs>
              <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />}
            <XAxis dataKey="x" tick={{fontSize: 12}} angle={-45} textAnchor="end" />
            <YAxis tickFormatter={formatValue} tick={{fontSize: 12}} />
            <Tooltip />
            {showLegend && <Legend verticalAlign="top" height={36}/>}
            <Area 
                type="monotone" 
                dataKey="y" 
                stroke={primaryColor} 
                fillOpacity={1} 
                fill="url(#colorY)" 
                strokeWidth={3} 
                onClick={(data: any) => handleDrillDown(data)}
                style={{ cursor: 'pointer' }}
            />
          </AreaChart>
        )
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={processedData.slice(0, 10)}
              dataKey="y"
              nameKey="x"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={5}
              label={({ x, percent }) => `${x} (${((percent || 0) * 100).toFixed(0)}%)`}
              onClick={(data: any) => handleDrillDown(data)}
              style={{ cursor: 'pointer' }}
            >
              {processedData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            {showLegend && <Legend />}
          </PieChart>
        )
      case 'scatter':
        return (
          <ScatterChart {...props}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis dataKey="x" name={xAxisKey} />
            <YAxis dataKey="y" name={yAxisKey} tickFormatter={formatValue} />
            <ZAxis range={[60, 400]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            {showLegend && <Legend verticalAlign="top" height={36}/>}
            <Scatter 
                name={yAxisKey} 
                data={processedData} 
                fill={primaryColor} 
                 onClick={(data: any) => handleDrillDown(data)}
                 style={{ cursor: 'pointer' }}
            />
          </ScatterChart>
        )
    }
  }


  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-1000">
      
      {/* TOOLBAR (Module 1, 3) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 glass-panel rounded-[32px] border-black/[0.03] shadow-md">
        <div className="flex items-center gap-2">
            <div className={`flex items-center bg-black/5 p-1 rounded-2xl`}>
                {(['bar', 'line', 'area', 'pie', 'scatter'] as ChartType[]).map(type => (
                    <button
                        key={type}
                        onClick={() => setChartType(type)}
                        className={`p-2.5 rounded-xl transition-all ${chartType === type ? 'bg-white text-vivid-purple shadow-sm scale-110' : 'text-foreground/40 hover:text-foreground'}`}
                        title={type.toUpperCase()}
                    >
                        {type === 'bar' && <BarChart3 className="w-5 h-5" />}
                        {type === 'line' && <ArrowUpDown className="w-5 h-5 rotate-45" />}
                        {type === 'area' && <Layers className="w-5 h-5" />}
                        {type === 'pie' && <ChevronDown className="w-5 h-5" />}
                        {type === 'scatter' && <MousePointer2 className="w-5 h-5" />}
                    </button>
                ))}
            </div>
            
            <div className="h-8 w-px bg-black/5 mx-2" />
            
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${showFilters ? 'bg-vivid-purple text-white' : 'bg-black/5 text-foreground/60 hover:bg-black/10'}`}
            >
                <Filter className="w-4 h-4" />
                Filters {Object.keys(categoricalFilters).length + Object.keys(numericFilters).length > 0 && `(${Object.keys(categoricalFilters).length + Object.keys(numericFilters).length})`}
            </button>
        </div>

        <div className="flex items-center gap-3">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-hover:text-vivid-purple transition-colors" />
                <input 
                    type="text" 
                    placeholder="Quick search..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-6 py-2.5 rounded-2xl bg-black/[0.02] border border-black/5 text-sm font-medium outline-none focus:border-vivid-purple/30 focus:ring-4 focus:ring-vivid-purple/5 transition-all w-48 focus:w-64"
                />
            </div>
            <button 
                onClick={handlePin}
                className="p-2.5 rounded-2xl bg-black/5 text-foreground/60 hover:bg-black/10 hover:text-vivid-red transition-all"
                title="Pin to Dashboard"
            >
                <Plus className="w-5 h-5" />
            </button>
            <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2.5 rounded-2xl transition-all ${showSettings ? 'bg-black text-white' : 'bg-black/5 text-foreground/60 hover:bg-black/10'}`}
            >
                <Settings2 className="w-5 h-5" />
            </button>
            <button className="p-2.5 rounded-2xl bg-vivid-purple/10 text-vivid-purple hover:bg-vivid-purple hover:text-white transition-all">
                <Download className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[600px]">
        {/* MAIN CHART AREA */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            {/* Legend / Info Bar */}
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 px-4">
                <div className="flex items-center gap-1.5"><Type className="w-3.5 h-3.5" /> X: {xAxisKey}</div>
                <div className="w-1 h-1 rounded-full bg-black/10" />
                <div className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> Y: {yAxisKey} ({aggregation})</div>
                <div className="flex-1" />
                <div className="flex items-center gap-1.5 bg-vivid-purple/5 text-vivid-purple px-3 py-1.5 rounded-full border border-vivid-purple/10 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" /> Live Insights Ready
                </div>
            </div>

            <div className="flex-1 glass-panel rounded-[48px] p-8 border-black/[0.03] shadow-2xl relative overflow-hidden bg-white/50 min-h-[500px]">
                <div className="absolute top-8 left-8">
                    <h2 className="text-2xl font-heading font-black text-foreground tracking-tighter">
                        {chartTitle || `${aggregation === 'count' ? 'Record Distribution' : aggregation.toUpperCase() + ' of ' + yAxisKey} by ${xAxisKey}`}
                    </h2>
                    <p className="text-[10px] font-black text-foreground/20 uppercase tracking-widest mt-1">High-fidelity data rendering</p>
                </div>
                
                <div className="h-[400px] pt-20">
                    <ResponsiveContainer width="100%" height="100%">
                        {renderChart()}
                    </ResponsiveContainer>
                </div>

                {/* MODULE 12: INSIGHTS FEED */}
                <div className="mt-8 pt-8 border-t border-black/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-vivid-purple/10 flex items-center justify-center text-vivid-purple">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <h4 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Autonomous Intelligence Feed</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {insights.map((insight, i) => (
                            <div key={i} className="flex gap-3 p-4 rounded-2xl bg-black/[0.02] border border-black/[0.03] group hover:bg-white hover:shadow-lg transition-all">
                                <Zap className="w-4 h-4 text-vivid-purple mt-0.5" />
                                <p className="text-xs font-bold text-foreground/60 leading-relaxed group-hover:text-foreground transition-colors italic">"{insight}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>

        {/* SIDE PANELS (Module 2, 7) */}
        {(showSettings || showFilters) && (
            <div className="w-full lg:w-80 flex flex-col gap-6 animate-in slide-in-from-right-8 duration-500">
                {showSettings && (
                    <div className="glass-panel rounded-[40px] p-8 border-black/[0.03] shadow-xl space-y-8 max-h-[700px] overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-heading font-black text-foreground uppercase tracking-tighter">Configuration</h3>
                            <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center"><Palette className="w-5 h-5 text-foreground/20" /></div>
                        </div>

                        {/* Axis Selectors */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-foreground/30 uppercase tracking-widest block mb-2">Dimension (X)</label>
                                <select 
                                    value={xAxisKey}
                                    onChange={(e) => setXAxisKey(e.target.value)}
                                    className="w-full bg-black/5 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-vivid-purple/20 transition-all outline-none"
                                >
                                    {allHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-foreground/30 uppercase tracking-widest block mb-2">Metric (Y)</label>
                                <select 
                                    value={yAxisKey}
                                    onChange={(e) => setYAxisKey(e.target.value)}
                                    className="w-full bg-black/5 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-vivid-purple/20 transition-all outline-none"
                                >
                                    {allHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-foreground/30 uppercase tracking-widest block mb-2">Aggregation</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['sum', 'avg', 'count'] as AggregationType[]).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setAggregation(type)}
                                            className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${aggregation === type ? 'bg-vivid-purple text-white scale-105' : 'bg-black/5 text-foreground/40 hover:bg-black/10'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-black/5" />

                        {/* Aesthetics (Module 2) */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-foreground/30 uppercase tracking-widest block mb-2">Primary Aesthetic</label>
                                <div className="flex gap-2">
                                    {['#4f46e5', '#ec4899', '#06b6d4', '#10b981', '#000000'].map(c => (
                                        <button 
                                            key={c}
                                            onClick={() => setPrimaryColor(c)}
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${primaryColor === c ? 'border-vivid-purple scale-125' : 'border-transparent'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                    <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-8 h-8 border-none bg-none cursor-pointer" />
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-foreground/60">Show Grid</span>
                                <button onClick={() => setShowGrid(!showGrid)} className={`w-12 h-6 rounded-full transition-all relative ${showGrid ? 'bg-vivid-purple' : 'bg-black/10'}`}>
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${showGrid ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-foreground/60">Show Legend</span>
                                <button onClick={() => setShowLegend(!showLegend)} className={`w-12 h-6 rounded-full transition-all relative ${showLegend ? 'bg-vivid-purple' : 'bg-black/10'}`}>
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${showLegend ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Calculated Fields (Module 7) */}
                        <div className="h-px bg-black/5" />
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">Calculated Fields</h4>
                                <Zap className="w-3.5 h-3.5 text-vivid-rose" />
                            </div>
                            <button 
                                onClick={() => {
                                    const name = prompt('Field Name?')
                                    const formula = prompt('Formula? (Use [ColumnName] + [Other])')
                                    if (name && formula) setCalculatedFields([...calculatedFields, { name, formula }])
                                }}
                                className="w-full py-3 rounded-2xl border border-dashed border-black/10 text-xs font-bold text-foreground/40 hover:text-vivid-purple hover:border-vivid-purple/30 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add Metric
                            </button>
                            {calculatedFields.map((cf, i) => (
                                <div key={i} className="p-3 rounded-2xl bg-vivid-rose/5 border border-vivid-rose/10 flex items-center justify-between group">
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-black text-vivid-rose truncate">{cf.name}</p>
                                        <p className="text-[9px] font-medium text-vivid-rose/40 truncate italic">{cf.formula}</p>
                                    </div>
                                    <button onClick={() => setCalculatedFields(calculatedFields.filter((_, idx) => idx !== i))} className="opacity-0 group-hover:opacity-100 p-1 hover:text-vivid-rose transition-all">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {showFilters && (
                    <div className="glass-panel rounded-[40px] p-8 border-black/[0.03] shadow-xl space-y-8 max-h-[700px] overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-heading font-black text-foreground uppercase tracking-tighter">Advanced Filters</h3>
                            <Filter className="w-5 h-5 text-vivid-purple" />
                        </div>

                        <div className="space-y-6">
                            {headers.map(h => {
                                const type = getColType(h)
                                if (type === 'categorical') {
                                    // Get unique values
                                    const uniques = Array.from(new Set(data.map(r => String(r[h])))).slice(0, 10)
                                    return (
                                        <div key={h} className="space-y-2">
                                            <label className="text-[10px] font-black text-foreground/30 uppercase tracking-widest block">{h}</label>
                                            <div className="flex flex-wrap gap-2">
                                                {uniques.map(val => (
                                                    <button
                                                        key={val}
                                                        onClick={() => {
                                                            const current = categoricalFilters[h] || []
                                                            if (current.includes(val)) setCategoricalFilters({ ...categoricalFilters, [h]: current.filter(v => v !== val) })
                                                            else setCategoricalFilters({ ...categoricalFilters, [h]: [...current, val] })
                                                        }}
                                                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${categoricalFilters[h]?.includes(val) ? 'bg-vivid-purple text-white' : 'bg-black/5 text-foreground/40 hover:bg-black/10'}`}
                                                    >
                                                        {val}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                }
                                return null
                            })}
                        </div>
                        
                        {(Object.keys(categoricalFilters).length > 0 || Object.keys(numericFilters).length > 0) && (
                            <button 
                                onClick={() => { setCategoricalFilters({}); setNumericFilters({}); }}
                                className="w-full py-3 rounded-2xl bg-vivid-rose/10 text-vivid-rose text-xs font-black uppercase tracking-widest hover:bg-vivid-rose hover:text-white transition-all"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  )
}
