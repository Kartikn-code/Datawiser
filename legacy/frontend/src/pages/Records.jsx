import React, { useEffect, useMemo, useState } from "react";
import { backendAPI } from "../services/api";

const PAGE_SIZE = 20;

export default function Records() {
  const [uploadId, setUploadId] = useState(
    Number(localStorage.getItem("dw_upload_id") || 1),
  );
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    q: "",
    route: "",
    truck: "",
    start_date: "",
    end_date: "",
  });
  const [newRecordText, setNewRecordText] = useState("{}");

  const fetchRecords = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        skip: page * PAGE_SIZE,
        limit: PAGE_SIZE,
        ...filters,
      };
      const res = await backendAPI.getRecords(uploadId, params);
      setRecords(res.data.records || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch records");
      setRecords([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem("dw_upload_id", String(uploadId));
    fetchRecords();
  }, [uploadId, page]);

  const headers = useMemo(() => {
    const keys = new Set();
    records.forEach((r) =>
      Object.keys(r.data || {}).forEach((k) => keys.add(k)),
    );
    return Array.from(keys).slice(0, 10);
  }, [records]);

  const updateFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const applyFilters = () => {
    setPage(0);
    fetchRecords();
  };

  const removeRecord = async (recordId) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await backendAPI.deleteRecord(recordId);
      fetchRecords();
    } catch (err) {
      setError(err.response?.data?.detail || "Delete failed");
    }
  };

  const addRecord = async () => {
    try {
      const parsed = JSON.parse(newRecordText);
      await backendAPI.createRecord(uploadId, { data: parsed });
      setNewRecordText("{}");
      fetchRecords();
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid JSON or create failed");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              Records & Smart Search
            </h1>
            <p className="text-slate-600 mt-1">
              Manage dynamic records with search by truck, route, and date
              range.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Upload ID</label>
            <input
              type="number"
              value={uploadId}
              min="1"
              onChange={(e) => setUploadId(Number(e.target.value || 1))}
              className="w-24 rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-5">
          <input
            className="rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Search text"
            value={filters.q}
            onChange={(e) => updateFilter("q", e.target.value)}
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Route"
            value={filters.route}
            onChange={(e) => updateFilter("route", e.target.value)}
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Truck"
            value={filters.truck}
            onChange={(e) => updateFilter("truck", e.target.value)}
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2"
            type="date"
            value={filters.start_date}
            onChange={(e) => updateFilter("start_date", e.target.value)}
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2"
            type="date"
            value={filters.end_date}
            onChange={(e) => updateFilter("end_date", e.target.value)}
          />
        </div>

        <div className="flex gap-3 mt-4 flex-wrap">
          <button
            onClick={applyFilters}
            className="rounded-lg bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 font-semibold"
          >
            Apply Filters
          </button>
          <a
            className="rounded-lg bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 font-semibold"
            href={backendAPI.exportCsv(uploadId)}
            target="_blank"
          >
            Export CSV
          </a>
          <a
            className="rounded-lg bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 font-semibold"
            href={backendAPI.exportXlsx(uploadId)}
            target="_blank"
          >
            Export XLSX
          </a>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-3">
          Quick Add Record (JSON)
        </h3>
        <textarea
          className="w-full h-24 rounded-xl border border-slate-300 px-3 py-2 font-mono text-sm"
          value={newRecordText}
          onChange={(e) => setNewRecordText(e.target.value)}
        />
        <button
          onClick={addRecord}
          className="mt-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 font-semibold"
        >
          Add Record
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {headers.map((h) => (
                <th key={h} className="text-left px-4 py-3 text-slate-600">
                  {h}
                </th>
              ))}
              <th className="text-right px-4 py-3 text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  className="px-4 py-8 text-slate-500"
                  colSpan={headers.length + 1}
                >
                  Loading...
                </td>
              </tr>
            )}
            {!loading && records.length === 0 && (
              <tr>
                <td
                  className="px-4 py-8 text-slate-500"
                  colSpan={headers.length + 1}
                >
                  No records found
                </td>
              </tr>
            )}
            {!loading &&
              records.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  {headers.map((h) => (
                    <td
                      key={`${row.id}-${h}`}
                      className="px-4 py-3 text-slate-700"
                    >
                      {String(row.data?.[h] ?? "-").slice(0, 40)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => removeRecord(row.id)}
                      className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Page {page + 1} of {totalPages} • {total} records
        </p>
        <div className="flex gap-2">
          <button
            disabled={page <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
