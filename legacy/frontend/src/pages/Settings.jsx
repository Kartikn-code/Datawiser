import React from "react";

export default function Settings() {
  const user = JSON.parse(localStorage.getItem("dw_user") || "{}");

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-3xl font-black text-slate-900">
          Workspace Settings
        </h1>
        <p className="text-slate-600 mt-1">
          Role-aware access and account context.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">Current User</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
            <p className="text-sm text-slate-500">Name</p>
            <p className="font-semibold text-slate-900">{user.name || "-"}</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
            <p className="text-sm text-slate-500">Email</p>
            <p className="font-semibold text-slate-900">{user.email || "-"}</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
            <p className="text-sm text-slate-500">Role</p>
            <p className="font-semibold text-slate-900 capitalize">
              {user.role || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
