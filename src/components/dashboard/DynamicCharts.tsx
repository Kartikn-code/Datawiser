'use client'

import React, { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { Filter, BarChart as BarChartIcon, Settings2, Hash } from 'lucide-react'

interface DynamicChartsProps {
  data: any[]
  headers: string[]
}

const COLORS = ['#4f46e5', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#84cc16', '#a855f7']

export default function DynamicCharts({ data, headers }: DynamicChartsProps) {
  // Determine default numeric and category headers
  const numericHeaders = headers.filter(header => {
    return data.some(row => typeof row[header] === 'number' || (typeof row[header] === 'string' && !isNaN(Number(row[header])) && row[header].trim() !== ''))
  })
  
  const categoryHeaders = headers.filter(header => !numericHeaders.includes(header))
  const defaultXAxis = categoryHeaders.length > 0 ? categoryHeaders[0] : headers[0]
  const defaultYAxis = numericHeaders.length > 0 ? numericHeaders[0] : (headers.length > 1 ? headers[1] : headers[0])

  const [xAxisKey, setXAxisKey] = useState<string>(defaultXAxis || '')
  const [yAxisKey, setYAxisKey] = useState<string>(defaultYAxis || '')
  const [aggregation, setAggregation] = useState<'sum' | 'avg' | 'count'>('sum')
  const [searchTerm, setSearchTerm] = useState('')

  // Process data (PowerBI Engine)
  const chartData = useMemo(() => {
    if (!data || data.length === 0 || !xAxisKey || !yAxisKey) return []

    // 1. Filter
    let processed = data
    if (searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase()
      processed = processed.filter(row => {
        return Object.values(row).some(val => 
          val !== null && val !== undefined && val.toString().toLowerCase().includes(lowerSearch)
        )
      })
    }

    // 2. Group by X-Axis
    const groups: Record<string, any[]> = {}
    processed.forEach(row => {
      const groupValue = row[xAxisKey]
      const key = groupValue !== null && groupValue !== undefined ? String(groupValue) : 'Unknown'
      
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(row)
    })

    // 3. Aggregate
    const aggregated = Object.keys(groups).map(key => {
      const groupRows = groups[key]
      
      let finalValue = 0
      
      if (aggregation === 'count') {
        finalValue = groupRows.length
      } else {
        let total = 0
        let validCount = 0
        
        groupRows.forEach(row => {
          const val = row[yAxisKey]
          const num = typeof val === 'number' ? val : Number(val)
          if (!isNaN(num)) {
            total += num
            validCount++
          }
        })

        if (aggregation === 'sum') {
          finalValue = total
        } else if (aggregation === 'avg') {
          finalValue = validCount > 0 ? total / validCount : 0
        }
      }

      // Round to 2 decimals if not a perfect integer
      finalValue = Number(finalValue.toFixed(2))

      return {
        [xAxisKey]: key,
        [yAxisKey]: finalValue,
        // Also keep the raw unaggregated count just in case
        _count: groupRows.length
      }
    })

    // 4. Sort (descending by the aggregated value)
    aggregated.sort((a, b) => (b[yAxisKey] as any) - (a[yAxisKey] as any))

    return aggregated
  }, [data, xAxisKey, yAxisKey, aggregation, searchTerm])

  if (!data || data.length === 0) {
    return <div className="text-gray-500 p-8 text-center bg-gray-50 rounded-xl">No data available to chart</div>
  }

  // Format value for ticks and tooltips
  const formatValue = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`
    return val.toString()
  }

  const tooltipFormatter = (value: number) => {
    return [value, `${aggregation.toUpperCase()} of ${yAxisKey}`]
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Control Panel (PowerBI Mode) */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 min-w-[200px] w-full">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            Filter Data
          </label>
          <input 
            type="text" 
            placeholder="Search any keyword..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm rounded-xl border-gray-200 border px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
          />
        </div>

        <div className="flex-1 min-w-[150px] w-full">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <BarChartIcon className="w-3.5 h-3.5" />
            Dimension (X-Axis)
          </label>
          <select 
            value={xAxisKey}
            onChange={(e) => setXAxisKey(e.target.value)}
            className="w-full text-sm rounded-xl border-gray-200 border px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            {headers.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[150px] w-full">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5" />
            Metric (Y-Axis)
          </label>
          <select 
            value={yAxisKey}
            onChange={(e) => setYAxisKey(e.target.value)}
            className="w-full text-sm rounded-xl border-gray-200 border px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            {headers.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[150px] w-full">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Settings2 className="w-3.5 h-3.5" />
            Aggregation
          </label>
          <select 
            value={aggregation}
            onChange={(e) => setAggregation(e.target.value as any)}
            className="w-full text-sm rounded-xl border-gray-200 border px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            <option value="sum">Sum</option>
            <option value="avg">Average</option>
            <option value="count">Count Rows</option>
          </select>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center text-gray-500">
          No data matches your filters mapping.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 tracking-tight capitalize">
              {aggregation} of {yAxisKey}
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.slice(0, 50)} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey={xAxisKey} 
                    tick={{ fontSize: 11, fill: '#6b7280' }} 
                    tickLine={false} 
                    axisLine={false} 
                    angle={-45} 
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#6b7280' }} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={formatValue}
                    width={45}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '13px' }}
                    formatter={tooltipFormatter as any}
                  />
                  <Bar dataKey={yAxisKey} fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">Showing top {Math.min(chartData.length, 50)} results</p>
          </div>

          {/* Line Chart */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 tracking-tight">Trend Analytics</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.slice(0, 50)} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey={xAxisKey} 
                    tick={{ fontSize: 11, fill: '#6b7280' }} 
                    tickLine={false} 
                    axisLine={false} 
                    angle={-45}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#6b7280' }} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={formatValue}
                    width={45}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '13px' }}
                    formatter={tooltipFormatter as any}
                  />
                  <Line type="monotone" dataKey={yAxisKey} stroke="#ec4899" strokeWidth={3} dot={{ r: 3, fill: '#ec4899' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">Showing top {Math.min(chartData.length, 50)} results</p>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 mb-4 tracking-tight">Proportions (Top 10)</h3>
            <div className="h-[350px] w-full flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '13px' }}
                    formatter={tooltipFormatter as any}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Pie
                    data={chartData.slice(0, 10)}
                    dataKey={yAxisKey}
                    nameKey={xAxisKey}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={130}
                    paddingAngle={3}
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {chartData.slice(0, 10).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
