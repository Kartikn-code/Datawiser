import React, { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { backendAPI } from "../services/api";

const COLORS = ["#0ea5e9", "#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa"];

const KpiCard = ({ title, value }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
    <p className="text-sm text-slate-500 font-semibold">{title}</p>
    <p className="text-2xl font-black text-slate-900 mt-2">{value}</p>
  </div>
);

export default function Dashboard() {
  const [uploadId, setUploadId] = useState(
    Number(localStorage.getItem("dw_upload_id") || 1),
  );
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [analyticsRes, alertsRes] = await Promise.all([
          backendAPI.getAnalytics(uploadId),
          backendAPI.getAlerts(uploadId),
        ]);
        setData({ ...analyticsRes.data, alerts: alertsRes.data.alerts || [] });
      } catch (err) {
        setData(null);
        setError(
          err.response?.data?.detail ||
            "Failed to load analytics for this upload",
        );
      } finally {
        setLoading(false);
      }
    };

    localStorage.setItem("dw_upload_id", String(uploadId));
    load();
  }, [uploadId]);

  const routeChart = useMemo(
    () => (data?.route_stats || []).slice(0, 8),
    [data],
  );
  const truckChart = useMemo(
    () => (data?.truck_stats || []).slice(0, 8),
    [data],
  );
  const monthlyChart = useMemo(() => data?.monthly_trend || [], [data]);

  if (loading) {
    return <div className="text-slate-600">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            Transport Analytics Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Real-time financial and operational visibility from dynamic data.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-600 font-semibold">
            Upload ID
          </label>
          <input
            type="number"
            min="1"
            value={uploadId}
            onChange={(e) => setUploadId(Number(e.target.value || 1))}
            className="w-28 rounded-xl border border-slate-300 px-3 py-2"
          />
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800">
          {error}
        </div>
      )}

      {!data ? null : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Total Revenue"
              value={`INR ${Number(data.total_revenue || 0).toLocaleString()}`}
            />
            <KpiCard
              title="Total Expense"
              value={`INR ${Number(data.total_expense || 0).toLocaleString()}`}
            />
            <KpiCard
              title="Profit / Loss"
              value={`INR ${Number(data.profit_loss || 0).toLocaleString()}`}
            />
            <KpiCard
              title="Pending Deliveries"
              value={data.pending_deliveries || 0}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">
                Monthly Revenue Trend
              </h3>
              <div className="h-72">
                <ResponsiveContainer>
                  <LineChart data={monthlyChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#1d4ed8"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">
                Revenue Distribution by Top Routes
              </h3>
              <div className="h-72">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={routeChart}
                      dataKey="revenue"
                      nameKey="route"
                      outerRadius={100}
                    >
                      {routeChart.map((item, idx) => (
                        <Cell
                          key={item.route}
                          fill={COLORS[idx % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">
                Top Route Earnings
              </h3>
              <div className="h-72">
                <ResponsiveContainer>
                  <BarChart data={routeChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="route" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">
                Truck Performance
              </h3>
              <div className="h-72">
                <ResponsiveContainer>
                  <BarChart data={truckChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="truck" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Smart Alerts</h3>
            <div className="space-y-3">
              {(data.alerts || []).length === 0 && (
                <p className="text-slate-500">No alerts available.</p>
              )}
              {(data.alerts || []).map((alert, idx) => (
                <div
                  key={`${alert.type}-${idx}`}
                  className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3"
                >
                  <p className="font-semibold text-slate-800">
                    {alert.type.replaceAll("_", " ")}
                  </p>
                  <p className="text-sm text-slate-600">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
