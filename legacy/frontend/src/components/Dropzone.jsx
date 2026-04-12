import { useState, useRef } from 'react';
import { UploadCloud } from 'lucide-react';

const Dropzone = ({ onFileUpload }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file) => {
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (validExtensions.includes(fileExtension)) {
      onFileUpload(file);
    } else {
      alert('Please upload a valid CSV or Excel file.');
    }
  };

  return (
    <div 
      className={`dropzone-container ${isDragActive ? 'active' : ''}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        className="file-input"
        accept=".csv,.xlsx,.xls"
      />
      <UploadCloud className="dropzone-icon" />
      <h3 className="dropzone-title">Click or drag a file here</h3>
      <p className="dropzone-subtitle">Support for Excel (.xlsx, .xls) and CSV files</p>
    </div>
  );
};

export default Dropzone;
