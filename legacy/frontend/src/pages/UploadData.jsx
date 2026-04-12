import React, { useState } from "react";
import { backendAPI } from "../services/api";

export default function UploadData() {
  const [file, setFile] = useState(null);
  const [uploadId, setUploadId] = useState(null);
  const [state, setState] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const pickFile = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    const lower = selected.name.toLowerCase();
    if (
      !lower.endsWith(".csv") &&
      !lower.endsWith(".xls") &&
      !lower.endsWith(".xlsx")
    ) {
      setError("Only CSV, XLS, and XLSX files are supported");
      return;
    }

    setFile(selected);
    setError("");
    setResult(null);
  };

  const upload = async () => {
    if (!file) return;
    setState("uploading");
    setError("");

    try {
      const res = await backendAPI.uploadFile(file);
      setUploadId(res.data.upload_id);
      localStorage.setItem("dw_upload_id", String(res.data.upload_id));
      setState("uploaded");
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed");
      setState("idle");
    }
  };

  const process = async () => {
    if (!uploadId) return;
    setState("processing");
    setError("");

    try {
      const res = await backendAPI.processUpload(uploadId);
      setResult(res.data);
      setState("done");
    } catch (err) {
      setError(err.response?.data?.detail || "Processing failed");
      setState("uploaded");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-3xl font-black text-slate-900">
          Smart Excel Upload Engine
        </h1>
        <p className="text-slate-600 mt-2">
          Upload messy transport sheets. Datawiser auto-detects repeated
          headers, builds dynamic schema, and cleans the data.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <input
          type="file"
          accept=".csv,.xls,.xlsx"
          onChange={pickFile}
          className="block w-full text-sm text-slate-600"
        />

        <div className="flex flex-wrap gap-3">
          <button
            onClick={upload}
            disabled={!file || state === "uploading" || state === "processing"}
            className="rounded-xl bg-blue-700 hover:bg-blue-800 text-white px-5 py-3 font-semibold disabled:opacity-50"
          >
            {state === "uploading" ? "Uploading..." : "Upload File"}
          </button>

          <button
            onClick={process}
            disabled={!uploadId || state === "processing"}
            className="rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-5 py-3 font-semibold disabled:opacity-50"
          >
            {state === "processing" ? "Processing..." : "Process & Clean"}
          </button>

          {uploadId && (
            <div className="rounded-xl bg-slate-100 border border-slate-200 px-4 py-3 text-sm text-slate-700">
              Active Upload ID: <strong>{uploadId}</strong>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3">
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900">
            Processing Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Rows Processed</p>
              <p className="text-xl font-bold text-slate-900">
                {result.metrics?.total_rows || 0}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Revenue Detected</p>
              <p className="text-xl font-bold text-slate-900">
                INR{" "}
                {Number(result.metrics?.total_revenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Repeated Headers Removed</p>
              <p className="text-xl font-bold text-slate-900">
                {result.stats?.repeated_headers_removed || 0}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Auto Fixes Applied</p>
              <p className="text-xl font-bold text-slate-900">
                {result.stats?.auto_fixes || 0}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
