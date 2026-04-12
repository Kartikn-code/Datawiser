'use client'

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

interface DynamicChartsProps {
  data: any[]
  headers: string[]
}

const COLORS = ['#4f46e5', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6']

export default function DynamicCharts({ data, headers }: DynamicChartsProps) {
  if (!data || data.length === 0) {
    return <div className="text-gray-500 p-8 text-center bg-gray-50 rounded-xl">No data available to chart</div>
  }

  // Attempt to identify numeric columns for Y axis
  const numericHeaders = headers.filter(header => {
    return data.some(row => typeof row[header] === 'number' || (typeof row[header] === 'string' && !isNaN(Number(row[header]))))
  })

  // Attempt to categorize columns for X axis (strings, dates)
  const categoryHeaders = headers.filter(header => !numericHeaders.includes(header))
  
  // If no category header, use an index, or use the first column anyway
  const xAxisKey = categoryHeaders.length > 0 ? categoryHeaders[0] : headers[0]
  
  // If no numeric headers, we can't really plot numerical charts easily, but we'll try with the first
  const yAxisKey = numericHeaders.length > 0 ? numericHeaders[0] : (headers.length > 1 ? headers[1] : headers[0])

  // Try to clean data if needed
  const chartData = data.slice(0, 100).map(row => {
    const newRow = { ...row }
    // Ensure yAxisKey is numeric, avoid NaN entirely
    if (typeof newRow[yAxisKey] === 'string') {
      const parsed = Number(newRow[yAxisKey])
      newRow[yAxisKey] = isNaN(parsed) ? 0 : parsed
    } else if (typeof newRow[yAxisKey] !== 'number') {
      newRow[yAxisKey] = 0
    }
    return newRow
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 tracking-tight">Distribution ({yAxisKey})</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey={xAxisKey} tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey={yAxisKey} fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 tracking-tight">Trend Analytics</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey={xAxisKey} tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey={yAxisKey} stroke="#ec4899" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart (if applicable, using grouped data) */}
        {categoryHeaders.length > 0 && numericHeaders.length > 0 && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 mb-4 tracking-tight">Proportions</h3>
            <div className="h-[300px] w-full flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                  <Legend />
                  <Pie
                    data={chartData.slice(0, 10)} // only take top 10 for pie
                    dataKey={yAxisKey}
                    nameKey={xAxisKey}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {chartData.slice(0, 10).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
