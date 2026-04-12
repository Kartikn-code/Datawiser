import React, { useMemo, useState } from "react";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import UploadData from "./pages/UploadData";
import Records from "./pages/Records";
import ChatAssistant from "./pages/ChatAssistant";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/upload", label: "Upload" },
  { to: "/records", label: "Records" },
  { to: "/chat", label: "AI Chat" },
  { to: "/reports", label: "Reports & Alerts" },
  { to: "/settings", label: "Settings" },
];

function AppShell({ user, onLogout }) {
  const initials = useMemo(
    () => (user?.name || "User").slice(0, 2).toUpperCase(),
    [user],
  );

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-blue-900">
                Datawiser Transport ERP
              </h1>
              <p className="text-sm text-slate-500">
                AI-driven operations and financial intelligence
              </p>
            </div>

            <nav className="flex flex-wrap gap-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-semibold ${
                      isActive
                        ? "bg-blue-700 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {user?.role || "staff"}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-700 text-white grid place-items-center text-sm font-bold">
                {initials}
              </div>
              <button
                onClick={onLogout}
                className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-black"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-4 md:p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadData />} />
            <Route path="/records" element={<Records />} />
            <Route path="/chat" element={<ChatAssistant />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("dw_user");
    return saved ? JSON.parse(saved) : null;
  });

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <AppShell
      user={user}
      onLogout={() => {
        localStorage.removeItem("dw_token");
        localStorage.removeItem("dw_user");
        setUser(null);
      }}
    />
  );
}
