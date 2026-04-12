import React, { useState } from "react";
import { backendAPI } from "../services/api";

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        const res = await backendAPI.login({
          email: form.email,
          password: form.password,
        });
        localStorage.setItem("dw_token", res.data.token);
        localStorage.setItem("dw_user", JSON.stringify(res.data.user));
        onLogin(res.data.user);
      } else {
        await backendAPI.signup({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        });
        setMode("login");
        setError("Account created. Login to continue.");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 grid place-items-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-sky-700 to-blue-700 text-white p-8">
          <h1 className="text-3xl font-black tracking-tight">Datawiser</h1>
          <p className="text-blue-100 mt-2">Transport Intelligence Platform</p>
        </div>

        <form className="p-8 space-y-5" onSubmit={submit}>
          {mode === "signup" && (
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Name
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              required
            />
          </div>

          {mode === "signup" && (
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Role
              </label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                value={form.role}
                onChange={(e) => setField("role", e.target.value)}
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-slate-100 border border-slate-200 text-slate-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Login"
                : "Create account"}
          </button>

          <button
            type="button"
            className="w-full text-sm text-blue-700 font-semibold"
            onClick={() => {
              setMode((prev) => (prev === "login" ? "signup" : "login"));
              setError("");
            }}
          >
            {mode === "login"
              ? "Need an account? Sign up"
              : "Already have an account? Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
