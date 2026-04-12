import { useState } from 'react';
import { Download, RefreshCw, Layers, Trash2, List, BarChart2, Table as TableIcon, Bot } from 'lucide-react';
import VisualAnalytics from './VisualAnalytics';
import AiAssistant from './AiAssistant';

const Dashboard = ({ data, fileName, onReset }) => {
  const [filterText, setFilterText] = useState('');
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'data'

  const { stats, columns, preview, csv_download } = data;

  const handleDownload = () => {
    const blob = new Blob([csv_download], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cleaned_${fileName.replace(/\.[^/.]+$/, "")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPreview = preview.filter((row) => {
    return Object.values(row).some(
      (val) => val && String(val).toLowerCase().includes(filterText.toLowerCase())
    );
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Data cleaning complete!</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-outline" onClick={onReset}>
            <RefreshCw size={16} /> Clean another file
          </button>
          <button className="btn-primary" onClick={handleDownload}>
            <Download size={18} /> Download Clean CSV
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-title"><List size={14} style={{display:'inline', marginRight:'6px'}}/> Original Rows</span>
          <span className="kpi-value">{stats.original_rows.toLocaleString()}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-title"><Trash2 size={14} style={{display:'inline', marginRight:'6px'}}/> Duplicates Removed</span>
          <span className="kpi-value success">{stats.duplicates_removed.toLocaleString()}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-title"><List size={14} style={{display:'inline', marginRight:'6px'}}/> Final Rows</span>
          <span className="kpi-value">{stats.final_rows.toLocaleString()}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-title"><Layers size={14} style={{display:'inline', marginRight:'6px'}}/> Columns Detected</span>
          <span className="kpi-value">{stats.columns_detected.toLocaleString()}</span>
        </div>
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart2 size={18} /> Visual Analytics
        </button>
        <button 
          className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          <TableIcon size={18} /> Raw Data Viewer
        </button>
        <button 
          className={`tab-btn ${activeTab === 'duplicates' ? 'active' : ''}`}
          onClick={() => setActiveTab('duplicates')}
        >
          <Trash2 size={18} /> Rejected Duplicates ({data.duplicates ? data.duplicates.length : 0})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'assistant' ? 'active' : ''}`}
          onClick={() => setActiveTab('assistant')}
        >
          <Bot size={18} /> AI Assistant
        </button>
      </div>

      {activeTab === 'analytics' && <VisualAnalytics data={data} />}
      {activeTab === 'assistant' && <AiAssistant data={data} />}
      
      {activeTab === 'data' && (
        <div className="table-wrapper">
          <div className="table-header">
            <h3>Cleaned Data Preview (Top 100 rows)</h3>
            <input
              type="text"
              className="filter-input"
              placeholder="Global search..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
          
          {filteredPreview.length > 0 ? (
            <div style={{ overflowX: 'auto', maxHeight: '600px' }}>
              <table>
                <thead>
                  <tr>
                    {columns.map((col, idx) => (
                      <th key={idx}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPreview.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {columns.map((col, colIdx) => (
                        <td key={colIdx}>{row[col] !== null ? String(row[col]) : ''}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No data matches your search.
            </div>
          )}
        </div>
      )}

      {activeTab === 'duplicates' && (
        <div className="table-wrapper">
          <div className="table-header">
            <div>
              <h3>Rejected Duplicate Rows</h3>
              <p style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>These rows were excluded because they exactly match previous entries in your file.</p>
            </div>
          </div>
          
          {(!data.duplicates || data.duplicates.length === 0) ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--accent-success)' }}>
              Great news! No duplicates were found in your dataset.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', maxHeight: '600px' }}>
              <table>
                <thead>
                  <tr>
                    {columns.map((col, idx) => (
                      <th key={idx}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.duplicates.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {columns.map((col, colIdx) => (
                        <td key={colIdx} style={{color: 'var(--accent-tertiary)'}}>{row[col] !== null ? String(row[col]) : ''}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
