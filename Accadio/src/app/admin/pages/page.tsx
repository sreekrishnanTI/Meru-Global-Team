"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Edit, Circle, Plus, X, Trash2 } from "lucide-react";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { useToast } from "@/components/admin/Toast";
import { fetchApi } from "@/lib/api";

interface PageData {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "published";
  lastUpdated: string;
}

export default function AdminPagesListPage() {
  const { showToast } = useToast();
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchPages = () => {
    fetchApi<PageData[]>("/pages")
      .then((data) => {
        setPages(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSlug) {
      showToast("error", "Title and slug are required");
      return;
    }
    setCreating(true);
    try {
      await fetchApi("/pages", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle,
          slug: newSlug,
          content: `<p>New content for ${newTitle}</p>`,
          status: "published",
        }),
      });
      showToast("success", "New page created in database!");
      setShowNewModal(false);
      setNewTitle("");
      setNewSlug("");
      fetchPages();
    } catch (err: any) {
      showToast("error", err.message || "Failed to create page");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" label="Loading pages..." />;

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            <h1 className="text-2xl font-black text-slate-900 font-heading">Content Pages Manager</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage existing website pages or publish brand new custom pages.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-lg shadow-emerald-600/25 active:scale-95 self-start sm:self-center"
        >
          <Plus className="h-4 w-4" /> Create New Page
        </button>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {pages.map((page) => (
          <Link
            key={page.id}
            href={`/admin/pages/${page.id}`}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all p-6 group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                  <FileText className="h-5 w-5" />
                </div>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    page.status === "published"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  <Circle className="h-2 w-2 fill-current" />
                  {page.status}
                </div>
              </div>

              <h3 className="text-base font-extrabold text-slate-800 group-hover:text-emerald-700 transition-colors">
                {page.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">/{page.slug}</p>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-semibold">Updated {formatDate(page.lastUpdated)}</span>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
                <span>Edit Page</span>
                <Edit className="h-3.5 w-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Create New Page Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 font-heading">Create New Page</h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePage} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Page Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (!newSlug) {
                      setNewSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, "-")
                          .replace(/-+/g, "-")
                      );
                    }
                  }}
                  placeholder="e.g. Careers or Annual Reports"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-bold text-slate-900 focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">URL Slug</label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-500">
                  <span>/</span>
                  <input
                    type="text"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    placeholder="careers"
                    required
                    className="w-full bg-transparent text-slate-900 font-bold focus:outline-hidden ml-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                >
                  {creating ? "Creating..." : "Create Page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
