"use client";

import React, { useEffect, useState } from "react";
import {
  Image,
  Video,
  FileText,
  Clock,
  Upload,
  GraduationCap,
  MessageSquareQuote,
  Database,
  ArrowRight,
  Sparkles,
  Inbox,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import StatsCard from "@/components/admin/StatsCard";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { fetchApi } from "@/lib/api";

interface DashboardData {
  photos: number;
  videos: number;
  totalPages: number;
  programs: number;
  testimonials: number;
  unreadInquiries: number;
  lastUpdated: string;
  database: {
    connected: boolean;
    version?: string;
    name?: string;
    error?: string;
  };
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchApi<DashboardData>("/dashboard").catch(() => null),
      fetchApi<any[]>("/contact/inquiries").catch(() => []),
    ])
      .then(([dashData, inqData]) => {
        if (dashData) setData(dashData);
        if (Array.isArray(inqData)) setInquiries(inqData.slice(0, 4));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" label="Loading dashboard metrics..." />;

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Just now";
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Content Management Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight">Accadio Control Room</h1>
          <p className="text-slate-300 text-sm font-medium mt-1">
            Manage real-time content, PostgreSQL database, media uploads, and client inquiries.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link
            href="/admin/homepage"
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
          >
            Edit Homepage
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Live Site
          </a>
        </div>
      </div>

      {/* Database Diagnostic Card */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          data?.database?.connected
            ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
            : "bg-amber-50/80 border-amber-200 text-amber-900"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                data?.database?.connected ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"
              }`}
            >
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold font-heading">
                  {data?.database?.connected ? "PostgreSQL Connected & Synchronized" : "PostgreSQL Setup Required"}
                </h3>
                {data?.database?.connected ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> Live
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full">
                    <AlertCircle className="h-3 w-3" /> Needs Password
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                {data?.database?.connected
                  ? `Active Database: ${data?.database?.name || "accardio"} | Engine: ${data?.database?.version?.slice(0, 35) || "PostgreSQL 14/18"}`
                  : `Please configure your PostgreSQL password in Admin Settings or Accadio/backend/.env to enable direct SQL sync.`}
              </p>
            </div>
          </div>

          <Link
            href="/admin/settings"
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap self-start sm:self-center transition-colors ${
              data?.database?.connected
                ? "bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 shadow-xs"
                : "bg-amber-600 text-white hover:bg-amber-700 shadow-md shadow-amber-600/20"
            }`}
          >
            {data?.database?.connected ? "View DB Diagnostics" : "Set PostgreSQL Password"}
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={GraduationCap}
          label="Training Programs"
          value={data?.programs ?? 0}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatsCard
          icon={MessageSquareQuote}
          label="Testimonials"
          value={data?.testimonials ?? 0}
          color="text-indigo-600"
          bgColor="bg-indigo-50"
        />
        <StatsCard
          icon={Image}
          label="Library Photos"
          value={data?.photos ?? 0}
          color="text-sky-600"
          bgColor="bg-sky-50"
        />
        <StatsCard
          icon={Inbox}
          label="New Inquiries"
          value={data?.unreadInquiries ?? inquiries.length}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
      </div>

      {/* Quick Action Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-slate-800 font-heading">Manage & Create Content</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/homepage"
            className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-xs hover:shadow-md hover:border-blue-400 transition-all group flex flex-col justify-between"
          >
            <div className="p-3 w-fit rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform mb-3">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Edit Homepage</p>
              <p className="text-xs text-slate-400 mt-0.5">Hero, Ticker, Stats & Values</p>
            </div>
          </Link>

          <Link
            href="/admin/programs"
            className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-xs hover:shadow-md hover:border-indigo-400 transition-all group flex flex-col justify-between"
          >
            <div className="p-3 w-fit rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform mb-3">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Add Program</p>
              <p className="text-xs text-slate-400 mt-0.5">Upload image & schedule event</p>
            </div>
          </Link>

          <Link
            href="/admin/testimonials"
            className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-xs hover:shadow-md hover:border-purple-400 transition-all group flex flex-col justify-between"
          >
            <div className="p-3 w-fit rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform mb-3">
              <MessageSquareQuote className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Add Testimonial</p>
              <p className="text-xs text-slate-400 mt-0.5">Alumni quotes & avatar photos</p>
            </div>
          </Link>

          <Link
            href="/admin/photos"
            className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-xs hover:shadow-md hover:border-sky-400 transition-all group flex flex-col justify-between"
          >
            <div className="p-3 w-fit rounded-xl bg-sky-50 text-sky-600 group-hover:scale-110 transition-transform mb-3">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Upload Media</p>
              <p className="text-xs text-slate-400 mt-0.5">Batch upload photos & videos</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Inquiries Inbox */}
      <div className="bg-white rounded-3xl border border-slate-200/70 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Inbox className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-extrabold text-slate-800 font-heading">Recent Website Inquiries</h2>
          </div>
          <Link
            href="/admin/contact"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All Inquiries <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {inquiries.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {inquiries.map((inq) => (
              <div key={inq.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{inq.name}</span>
                    <span className="text-[11px] text-slate-400">({inq.email})</span>
                    {inq.status === "unread" && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-50 text-rose-600">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{inq.message}</p>
                </div>
                <span className="text-[11px] text-slate-400 font-medium shrink-0">
                  {formatDate(inq.createdAt || inq.created_at)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">
            No inquiries received yet. Messages submitted through the website contact form will appear here.
          </p>
        )}
      </div>
    </div>
  );
}
