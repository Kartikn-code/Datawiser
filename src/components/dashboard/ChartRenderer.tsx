'use client'

import React, { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, ZAxis
} from 'recharts'

const COLORS = ['#4f46e5', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#84cc16', '#a855f7']

export interface ChartConfig {
    chartType: 'bar' | 'line' | 'pie' | 'area' | 'scatter'
    xAxisKey: string
    yAxisKey: string
    aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max'
    primaryColor?: string
    chartTitle?: string
    showGrid?: boolean
    showLegend?: boolean
    categoricalFilters?: Record<string, string[]>
    numericFilters?: Record<string, [number, number]>
    calculatedFields?: Array<{ name: string, formula: string }>
}

interface ChartRendererProps {
  data: any[]
  headers: string[]
  config: ChartConfig
  onDrillDown?: (data: any) => void
}

export default function ChartRenderer({ data, headers, config, onDrillDown }: ChartRendererProps) {
    const {
        chartType, xAxisKey, yAxisKey, aggregation, primaryColor = '#4f46e5',
        chartTitle, showGrid = true, showLegend = true,
        categoricalFilters = {}, numericFilters = {}, calculatedFields = []
    } = config

    // Same data processing logic as AnalyticsEngine
    const processedData = useMemo(() => {
        let result = data.map(row => {
            const enrichedRow = { ...row }
            calculatedFields.forEach(cf => {
                let formula = cf.formula
                headers.forEach(h => {
                    const val = Number(row[h]) || 0
                    formula = formula.replace(new RegExp(`\\[${h}\\]`, 'g'), val.toString())
                })
                try {
                    // eslint-disable-next-line no-eval
                    enrichedRow[cf.name] = eval(formula)
                } catch (e) {
                    enrichedRow[cf.name] = 0
                }
            })
            return enrichedRow
        })

        Object.entries(categoricalFilters).forEach(([col, values]) => {
            if (values.length > 0) result = result.filter(r => values.includes(String(r[col])))
        })
        Object.entries(numericFilters).forEach(([col, [min, max]]) => {
            result = result.filter(r => {
                const val = Number(r[col])
                return val >= min && val <= max
            })
        })

        const groups: Record<string, any[]> = {}
        result.forEach(row => {
            const key = String(row[xAxisKey] || 'Unknown')
            if (!groups[key]) groups[key] = []
            groups[key].push(row)
        })

        return Object.entries(groups).map(([key, rows]) => {
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
            return { x: key, y: Number(value.toFixed(2)) }
        })
    }, [data, xAxisKey, yAxisKey, aggregation, categoricalFilters, numericFilters, calculatedFields, headers])

    const formatValue = (val: number) => {
        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
        if (val >= 1000) return `${(val / 1000).toFixed(1)}k`
        return val.toString()
    }

    const commonProps = {
        data: processedData,
        margin: { top: 10, right: 10, left: 10, bottom: 40 }
    }

    const renderSelectedChart = () => {
        switch (chartType) {
            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />}
                        <XAxis dataKey="x" tick={{fontSize: 10}} angle={-45} textAnchor="end" />
                        <YAxis tickFormatter={formatValue} tick={{fontSize: 10}} />
                        <Tooltip />
                        {showLegend && <Legend verticalAlign="top"/>}
                        <Bar dataKey="y" fill={primaryColor} radius={[4, 4, 0, 0]} onClick={onDrillDown} />
                    </BarChart>
                )
            case 'line':
                return (
                    <LineChart {...commonProps}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />}
                        <XAxis dataKey="x" tick={{fontSize: 10}} angle={-45} textAnchor="end" />
                        <YAxis tickFormatter={formatValue} tick={{fontSize: 10}} />
                        <Tooltip />
                        {showLegend && <Legend verticalAlign="top"/>}
                        <Line type="monotone" dataKey="y" stroke={primaryColor} strokeWidth={2} dot={{r: 3}} />
                    </LineChart>
                )
            case 'area':
                return (
                    <AreaChart {...commonProps}>
                        <defs>
                            <linearGradient id={`grad-${yAxisKey}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />}
                        <XAxis dataKey="x" tick={{fontSize: 10}} angle={-45} textAnchor="end" />
                        <YAxis tickFormatter={formatValue} tick={{fontSize: 10}} />
                        <Tooltip />
                        <Area type="monotone" dataKey="y" stroke={primaryColor} fillOpacity={1} fill={`url(#grad-${yAxisKey})`} />
                    </AreaChart>
                )
            case 'pie':
                return (
                    <PieChart>
                        <Pie data={processedData.slice(0, 10)} dataKey="y" nameKey="x" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2}>
                            {processedData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        {showLegend && <Legend />}
                    </PieChart>
                )
            case 'scatter':
                return (
                    <ScatterChart {...commonProps}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
                        <XAxis dataKey="x" name={xAxisKey} />
                        <YAxis dataKey="y" name={yAxisKey} tickFormatter={formatValue} />
                        <ZAxis range={[50, 200]} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter data={processedData} fill={primaryColor} />
                    </ScatterChart>
                )
            default: return null
        }
    }

    return (
        <div className="w-full h-full flex flex-col">
            {chartTitle && <h3 className="text-sm font-bold text-foreground mb-4 truncate px-2">{chartTitle}</h3>}
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    {renderSelectedChart()}
                </ResponsiveContainer>
            </div>
        </div>
    )
}
