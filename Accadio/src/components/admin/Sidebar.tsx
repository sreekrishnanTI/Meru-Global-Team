"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  FileText,
  Image,
  Video,
  MessageSquareQuote,
  GraduationCap,
  Phone,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ExternalLink,
  Database,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { fetchApi } from "@/lib/api";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/homepage", label: "Homepage", icon: Home },
  { href: "/admin/programs", label: "Programs", icon: GraduationCap },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/admin/history", label: "Photo Journal & History", icon: Image },
  { href: "/admin/news", label: "News & Press", icon: FileText },
  { href: "/admin/photos", label: "Photos Library", icon: Image },
  { href: "/admin/videos", label: "Videos", icon: Video },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/contact", label: "Contact & Inquiries", icon: Phone },
  { href: "/admin/settings", label: "Settings & DB", icon: Settings },
];

interface SidebarProps {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; name?: string } | null>(null);

  useEffect(() => {
    fetchApi("/health")
      .then((data) => {
        if (data?.database) {
          setDbStatus(data.database);
        }
      })
      .catch(() => {
        setDbStatus({ connected: false });
      });
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const nav = (
    <>
      {/* Logo/Brand Header */}
      <div className={`px-5 py-6 border-b border-slate-100 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-600 animate-pulse" />
              <h1 className="text-lg font-black text-slate-900 font-heading tracking-tight">Accadio</h1>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Admin Portal</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Database Status Badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-slate-50">
          <Link
            href="/admin/settings"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${dbStatus?.connected
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100"
                : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
              }`}
          >
            <Database className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate flex-1">
              {dbStatus?.connected ? "PostgreSQL Active" : "PostgreSQL Setup"}
            </span>
            {dbStatus?.connected ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            )}
          </Link>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${active
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={`h-4.5 w-4.5 shrink-0 ${active ? "text-white" : "text-slate-400"}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Quick View Public Site */}
      {!collapsed && (
        <div className="px-3 pb-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-blue-600 border border-slate-200/60 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5" />
              View Live Website
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 font-extrabold">PROD</span>
          </a>
        </div>
      )}

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-slate-100 pt-3">
        <button
          onClick={onLogout}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors w-full ${collapsed ? "justify-center" : ""
            }`}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Hamburger toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-2xl bg-white border border-slate-200 shadow-md text-slate-700 hover:bg-slate-50"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-5 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>
        {nav}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-slate-200/80 h-screen sticky top-0 transition-all duration-300 z-30 ${collapsed ? "w-20" : "w-64"
          }`}
      >
        {nav}
      </aside>
    </>
  );
}
