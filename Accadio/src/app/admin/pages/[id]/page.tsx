"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Eye, EyeOff, Trash2, CheckCircle2, Globe } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import RichTextEditor from "@/components/admin/RichTextEditor";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { fetchApi } from "@/lib/api";

interface PageData {
  id: string;
  slug: string;
  title: string;
  content: string;
  status: "draft" | "published";
  metaTitle?: string;
  metaDescription?: string;
  lastUpdated?: string;
}

export default function AdminPageEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    fetchApi<PageData>(`/pages/${id}`)
      .then((data) => {
        setPage(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleSave = async (status?: "draft" | "published") => {
    if (!page) return;
    setSaving(true);
    try {
      const body = { ...page };
      if (status) body.status = status;

      const updated = await fetchApi<PageData>(`/pages/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });

      setPage(updated);
      showToast("success", status === "published" ? "Page published to PostgreSQL!" : "Draft saved!");
    } catch (err: any) {
      showToast("error", err.message || "Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await fetchApi(`/pages/${id}`, { method: "DELETE" });
      showToast("success", "Page deleted");
      router.push("/admin/pages");
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete page");
    } finally {
      setDeleteOpen(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" label="Loading page editor..." />;
  if (!page) return <p className="text-sm text-red-500">Page not found.</p>;

  return (
    <div className="space-y-6 pb-16">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/pages")}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 font-heading">{page.title}</h1>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                  page.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                }`}
              >
                {page.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">/{page.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? "Hide Preview" : "Live Preview"}
          </button>
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors disabled:bg-slate-300"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all disabled:bg-slate-300"
          >
            {saving ? (
              <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Publish
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete page"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Page Title & Slug metadata */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Page Title</label>
            <input
              type="text"
              value={page.title}
              onChange={(e) => setPage({ ...page, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-bold text-slate-900 focus:outline-hidden focus:border-blue-600"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">URL Slug</label>
            <input
              type="text"
              value={page.slug}
              onChange={(e) => setPage({ ...page, slug: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-mono text-slate-800 focus:outline-hidden focus:border-blue-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">SEO Meta Title</label>
            <input
              type="text"
              value={page.metaTitle || ""}
              onChange={(e) => setPage({ ...page, metaTitle: e.target.value })}
              placeholder="Search engine title..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-medium text-slate-800"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">SEO Meta Description</label>
            <input
              type="text"
              value={page.metaDescription || ""}
              onChange={(e) => setPage({ ...page, metaDescription: e.target.value })}
              placeholder="Search snippet summary..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-medium text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Editor & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-3">
          <h3 className="text-sm font-extrabold text-slate-800 font-heading">Page Content</h3>
          <RichTextEditor
            content={page.content || ""}
            onChange={(html) => setPage({ ...page, content: html })}
          />
        </div>

        {showPreview && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 font-heading border-b border-slate-100 pb-2">
              Live Preview
            </h3>
            <div
              className="prose prose-slate max-w-none p-4 rounded-2xl bg-slate-50 border border-slate-100 min-h-[300px]"
              dangerouslySetInnerHTML={{ __html: page.content || "<p class='text-slate-400'>No content</p>" }}
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Page"
        message={`Are you sure you want to permanently delete "/${page.slug}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
