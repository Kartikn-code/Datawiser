import React, { useEffect, useState } from "react";
import { backendAPI } from "../services/api";

export default function Reports() {
  const [uploadId, setUploadId] = useState(
    Number(localStorage.getItem("dw_upload_id") || 1),
  );
  const [period, setPeriod] = useState("monthly");
  const [report, setReport] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [invoiceRecordId, setInvoiceRecordId] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const [reportRes, alertsRes, predRes] = await Promise.all([
        backendAPI.getReport(uploadId, period),
        backendAPI.getAlerts(uploadId),
        backendAPI.getPredictions(uploadId),
      ]);
      setReport(reportRes.data);
      setAlerts(alertsRes.data.alerts || []);
      setPrediction(predRes.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load intelligence modules",
      );
    }
  };

  useEffect(() => {
    localStorage.setItem("dw_upload_id", String(uploadId));
    load();
  }, [uploadId, period]);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-3xl font-black text-slate-900">
          Automated Reports & AI Intelligence
        </h1>
        <p className="text-slate-600 mt-1">
          Smart alerts, scheduled report views, trend predictions, and invoice
          generation.
        </p>

        <div className="mt-4 flex flex-wrap gap-3 items-center">
          <label className="text-sm text-slate-600">Upload ID</label>
          <input
            type="number"
            min="1"
            value={uploadId}
            onChange={(e) => setUploadId(Number(e.target.value || 1))}
            className="w-24 rounded-lg border border-slate-300 px-3 py-2"
          />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button
            onClick={load}
            className="rounded-lg bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 font-semibold"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">Smart Alerts</h2>
          <div className="mt-4 space-y-3">
            {alerts.length === 0 && (
              <p className="text-slate-500">No active alerts.</p>
            )}
            {alerts.map((a, idx) => (
              <div
                key={`${a.type}-${idx}`}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <p className="font-semibold text-slate-800">
                  {a.type.replaceAll("_", " ")}
                </p>
                <p className="text-sm text-slate-600">{a.message}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">AI Predictions</h2>
          {!prediction && (
            <p className="text-slate-500 mt-4">No prediction data</p>
          )}
          {prediction && (
            <div className="space-y-3 mt-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm text-slate-500">
                  Next Month Revenue (Forecast)
                </p>
                <p className="text-2xl font-black text-slate-900">
                  INR{" "}
                  {Number(prediction.next_month_revenue || 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm text-slate-500">Trend</p>
                <p className="text-lg font-bold text-slate-800 capitalize">
                  {prediction.trend || "n/a"}
                </p>
              </div>
              <p className="text-sm text-slate-600">{prediction.advice}</p>
            </div>
          )}
        </section>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">
          Automated Report Summary
        </h2>
        {!report && <p className="text-slate-500 mt-4">No report data</p>}
        {report && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-500">Revenue</p>
              <p className="font-bold text-slate-900">
                INR{" "}
                {Number(report.summary?.total_revenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-500">Expense</p>
              <p className="font-bold text-slate-900">
                INR{" "}
                {Number(report.summary?.total_expense || 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-500">Profit/Loss</p>
              <p className="font-bold text-slate-900">
                INR {Number(report.summary?.profit_loss || 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-500">Pending</p>
              <p className="font-bold text-slate-900">
                {report.summary?.pending_deliveries || 0}
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">
          Invoice Generator (Admin)
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Provide a record ID from the records grid to generate PDF invoice.
        </p>
        <div className="mt-4 flex gap-3 items-center flex-wrap">
          <input
            value={invoiceRecordId}
            onChange={(e) => setInvoiceRecordId(e.target.value)}
            placeholder="Record ID"
            className="rounded-lg border border-slate-300 px-3 py-2 w-32"
          />
          <a
            href={
              invoiceRecordId
                ? backendAPI.invoicePdf(uploadId, invoiceRecordId)
                : "#"
            }
            target="_blank"
            className="rounded-lg bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 font-semibold"
          >
            Download Invoice PDF
          </a>
        </div>
      </section>
    </div>
  );
}
