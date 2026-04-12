import { useState, useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import PropTypes from 'prop-types';
import { BarChart2, TrendingUp, PieChart as PieIcon, Activity } from 'lucide-react';

const COLORS = ['#6366f1', '#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'];

const VisualAnalytics = ({ data }) => {
  const { preview, columns } = data;

  // Basic column inference
  const numericColumns = useMemo(() => {
    if (!preview || preview.length === 0) return [];
    return columns.filter(col => {
      // Check first 15 rows to see if it parses to a valid number robustly
      const sample = preview.slice(0, 15).filter(row => {
        const val = row[col];
        return val !== null && val !== undefined && String(val).trim() !== '';
      });
      if (sample.length === 0) return false;
      return sample.every(row => {
        const cleaned = String(row[col]).replace(/[^0-9.-]+/g, "");
        return cleaned !== '' && !isNaN(Number(cleaned));
      });
    });
  }, [columns, preview]);

  const categoricalColumns = useMemo(() => {
    return columns.filter(col => !numericColumns.includes(col));
  }, [columns, numericColumns]);

  const [xAxis, setXAxis] = useState(categoricalColumns.length > 0 ? categoricalColumns[0] : columns[0]);
  const [yAxis, setYAxis] = useState(numericColumns.length > 0 ? numericColumns[0] : columns[0]);
  const [chartType, setChartType] = useState('bar'); // bar, line, area, pie

  // Sync state if user uploads a new file with completely different columns
  useEffect(() => {
    if (categoricalColumns.length > 0 && !categoricalColumns.includes(xAxis)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setXAxis(categoricalColumns[0]);
    } else if (categoricalColumns.length === 0 && columns.length > 0 && !columns.includes(xAxis)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setXAxis(columns[0]);
    }

    if (numericColumns.length > 0 && !numericColumns.includes(yAxis)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setYAxis(numericColumns[0]);
    } else if (numericColumns.length === 0 && columns.length > 0 && !columns.includes(yAxis)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setYAxis(columns[0]);
    }
  }, [columns, categoricalColumns, numericColumns, xAxis, yAxis]);

  // Aggregation logic (Summing yAxis grouped by xAxis)
  const chartData = useMemo(() => {
    if (!xAxis || !yAxis || !preview || preview.length === 0) return [];

    const grouped = {};
    preview.forEach(row => {
      let xVal = row[xAxis];
      if (xVal === null || xVal === undefined || String(xVal).trim() === '') {
        xVal = 'Unknown';
      } else {
        // Simple beautification for dates if they look like timestamps (2023-01-01 00:00:00)
        let formattedX = String(xVal);
        if (formattedX.endsWith("00:00:00")) {
          formattedX = formattedX.split(" ")[0];
        }
        xVal = formattedX;
      }

      let rawY = row[yAxis];
      let yVal = 0;
      if (rawY !== null && rawY !== undefined) {
        let cleaned = String(rawY).replace(/[^0-9.-]+/g, "");
        yVal = Number(cleaned);
      }
      if (isNaN(yVal)) yVal = 0;

      if (!grouped[xVal]) {
        grouped[xVal] = 0;
      }
      grouped[xVal] += yVal;
    });

    // Convert back to array
    const result = Object.keys(grouped).map(key => ({
      name: key,
      value: Number(grouped[key].toFixed(2)) // rounding for clean UI
    }));

    // Sort descending by default for better visuals (except if it looks like a date)
    const isDate = result.length > 0 && isNaN(Number(result[0].name)) && !isNaN(Date.parse(result[0].name));
    if (isDate) {
      result.sort((a, b) => new Date(a.name) - new Date(b.name));
    } else {
      result.sort((a, b) => b.value - a.value);
    }

    // Return top 20 to avoid over-cluttering the UI
    return result.slice(0, 20);
  }, [preview, xAxis, yAxis]);

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="no-chart-data">
          <h3>No valid data combinations</h3>
          <p>Please select a different dimension and measure.</p>
        </div>
      );
    }

    const formatTooltip = (value) => new Intl.NumberFormat('en-US').format(value);

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} tick={{ fill: '#94a3b8' }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickFormatter={(val) => new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(val)} />
              <RechartsTooltip
                contentStyle={{ backgroundColor: '#1e2030', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                formatter={(val) => [formatTooltip(val), yAxis]}
              />
              <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, fill: '#06b6d4', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} tick={{ fill: '#94a3b8' }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickFormatter={(val) => new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(val)} />
              <RechartsTooltip
                contentStyle={{ backgroundColor: '#1e2030', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                formatter={(val) => [formatTooltip(val), yAxis]}
              />
              <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={140}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{ backgroundColor: '#1e2030', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                formatter={(val) => [formatTooltip(val), yAxis]}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} tick={{ fill: '#94a3b8' }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickFormatter={(val) => new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(val)} />
              <RechartsTooltip
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: '#1e2030', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                formatter={(val) => [formatTooltip(val), yAxis]}
              />
              <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="bi-layout">
      {/* Sidebar Controls */}
      <div className="bi-sidebar">
        <h3>Visual Controls</h3>

        <div className="bi-field-group">
          <label className="bi-label">Dimension (X-Axis)</label>
          <select
            className="bi-select"
            value={xAxis}
            onChange={(e) => setXAxis(e.target.value)}
          >
            {columns.map(col => (
              <option key={col} value={col}>
                {col} {categoricalColumns.includes(col) ? '(Text)' : '(Num)'}
              </option>
            ))}
          </select>
        </div>

        <div className="bi-field-group">
          <label className="bi-label">Measure (Y-Axis) - Summed</label>
          <select
            className="bi-select"
            value={yAxis}
            onChange={(e) => setYAxis(e.target.value)}
          >
            {numericColumns.map(col => (
              <option key={col} value={col}>{col} (Num)</option>
            ))}
            {/* Allow fallbacks if detection missed numeric columns */}
            {categoricalColumns.map(col => (
              <option key={col} value={col}>{col} (Text)</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="bi-chart-area">
        <div className="bi-chart-header">
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-main)' }}>
            {yAxis} by {xAxis}
          </h2>

          <div className="chart-type-selector">
            <button
              className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
              onClick={() => setChartType('bar')}
              title="Bar Chart"
            >
              <BarChart2 size={20} />
            </button>
            <button
              className={`chart-type-btn ${chartType === 'line' ? 'active' : ''}`}
              onClick={() => setChartType('line')}
              title="Line Chart"
            >
              <TrendingUp size={20} />
            </button>
            <button
              className={`chart-type-btn ${chartType === 'area' ? 'active' : ''}`}
              onClick={() => setChartType('area')}
              title="Area Chart"
            >
              <Activity size={20} />
            </button>
            <button
              className={`chart-type-btn ${chartType === 'pie' ? 'active' : ''}`}
              onClick={() => setChartType('pie')}
              title="Pie Chart"
            >
              <PieIcon size={20} />
            </button>
          </div>
        </div>

        <div className="chart-wrapper">
          {renderChart()}
        </div>
      </div>
    </div>
  );
};

VisualAnalytics.propTypes = {
  data: PropTypes.shape({
    preview: PropTypes.arrayOf(PropTypes.object).isRequired,
    columns: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
};

export default VisualAnalytics;
