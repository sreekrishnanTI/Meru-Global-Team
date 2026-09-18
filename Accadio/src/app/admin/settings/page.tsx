"use client";

import React, { useEffect, useState } from "react";
import {
  Save,
  Lock,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  ShieldAlert,
  Sliders,
} from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { fetchApi } from "@/lib/api";

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // PostgreSQL settings state
  const [dbConfig, setDbConfig] = useState({
    host: "localhost",
    port: "5432",
    user: "postgres",
    password: "",
    database: "accardio",
  });
  const [testingDb, setTestingDb] = useState(false);
  const [savingDb, setSavingDb] = useState(false);
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    version?: string;
    name?: string;
    error?: string;
  } | null>(null);

  const loadDbStatus = () => {
    fetchApi("/health")
      .then((res) => {
        if (res?.database) {
          setDbStatus(res.database);
        }
      })
      .catch(() => {
        setDbStatus({ connected: false, error: "Backend server unreachable on port 5000" });
      });
  };

  useEffect(() => {
    loadDbStatus();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast("error", "Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("error", "New passwords do not match");
      return;
    }

    setSavingPassword(true);
    try {
      await fetchApi("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      showToast("success", "Admin password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showToast("error", err.message || "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingDb(true);
    try {
      const res = await fetchApi<{ success: boolean; version?: string; error?: string }>("/health/test-db", {
        method: "POST",
        body: JSON.stringify(dbConfig),
      });

      if (res.success) {
        showToast("success", `PostgreSQL connection successful! (${res.version?.slice(0, 30)})`);
      } else {
        showToast("error", `Connection failed: ${res.error}`);
      }
    } catch (err: any) {
      showToast("error", `Test error: ${err.message}`);
    } finally {
      setTestingDb(false);
    }
  };

  const handleSaveDbConfig = async () => {
    setSavingDb(true);
    try {
      const res = await fetchApi<{ success: boolean; message: string }>("/health/save-db-config", {
        method: "POST",
        body: JSON.stringify(dbConfig),
      });

      if (res.success) {
        showToast("success", res.message || "Database configuration saved!");
        loadDbStatus();
      } else {
        showToast("error", res.message);
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to save database configuration");
    } finally {
      setSavingDb(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 font-heading">Settings & Database Hub</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Manage admin credentials and configure PostgreSQL database connections.
        </p>
      </div>

      {/* PostgreSQL Live Health & Configuration */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 font-heading">PostgreSQL Database Connection</h2>
              <p className="text-xs text-slate-500 font-medium">Direct relational database persistence for all content</p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadDbStatus}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        {/* Status Indicator */}
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 ${
            dbStatus?.connected
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-amber-50 border-amber-200 text-amber-900"
          }`}
        >
          {dbStatus?.connected ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div>
            <h4 className="text-xs font-extrabold">
              {dbStatus?.connected
                ? `Connected to PostgreSQL (${dbStatus.name || "accardio"})`
                : "PostgreSQL Connection Pending / Password Required"}
            </h4>
            <p className="text-[11px] mt-0.5 opacity-90 leading-relaxed font-medium">
              {dbStatus?.connected
                ? `PostgreSQL engine active: ${dbStatus.version?.slice(0, 45)}`
                : `Error: ${dbStatus?.error || "Password authentication failed"}. Please enter your local postgres password below and click 'Save & Connect'.`}
            </p>
          </div>
        </div>

        {/* Credentials Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 uppercase">Host</label>
            <input
              type="text"
              value={dbConfig.host}
              onChange={(e) => setDbConfig({ ...dbConfig, host: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 uppercase">Port (5432 or 5433)</label>
            <input
              type="text"
              value={dbConfig.port}
              onChange={(e) => setDbConfig({ ...dbConfig, port: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 uppercase">Database User</label>
            <input
              type="text"
              value={dbConfig.user}
              onChange={(e) => setDbConfig({ ...dbConfig, user: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 uppercase">Database Password</label>
            <input
              type="password"
              value={dbConfig.password}
              onChange={(e) => setDbConfig({ ...dbConfig, password: e.target.value })}
              placeholder="Your postgres password"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[11px] font-bold text-slate-600 uppercase">Database Name</label>
            <input
              type="text"
              value={dbConfig.database}
              onChange={(e) => setDbConfig({ ...dbConfig, database: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testingDb}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
          >
            {testingDb ? "Testing Connection..." : "Test Connection"}
          </button>
          <button
            type="button"
            onClick={handleSaveDbConfig}
            disabled={savingDb}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition-all shadow-md shadow-blue-600/20"
          >
            {savingDb ? (
              <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save & Connect Database
          </button>
        </div>
      </div>

      {/* Admin Password Change */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 font-heading">Change Admin Password</h2>
            <p className="text-xs text-slate-500 font-medium">Update the security credentials for your admin dashboard account.</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-600"
            />
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition-all shadow-md shadow-indigo-600/20 disabled:bg-slate-300"
          >
            {savingPassword ? (
              <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
