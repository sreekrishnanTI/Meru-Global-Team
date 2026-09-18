"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  User,
  ArrowUp,
  ArrowDown,
  Star,
  MessageSquareQuote,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { fetchApi } from "@/lib/api";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  photoPath: string;
  rating: number;
  program: string;
  region: string;
  displayOrder: number;
  active: boolean;
  createdAt: string;
}

const emptyForm = {
  name: "",
  role: "",
  quote: "",
  photoPath: "",
  rating: 5,
  program: "exchange",
  region: "Global",
};

export default function AdminTestimonialsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchItems = () => {
    fetchApi<Testimonial[]>("/testimonials")
      .then((data) => {
        setItems(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item: Testimonial) => {
    setEditId(item.id);
    setForm({
      name: item.name,
      role: item.role || "",
      quote: item.quote || "",
      photoPath: item.photoPath || "",
      rating: item.rating || 5,
      program: item.program || "exchange",
      region: item.region || "Global",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.quote) {
      showToast("error", "Name and quote are required");
      return;
    }
    setSaving(true);

    try {
      if (editId) {
        await fetchApi(`/testimonials/${editId}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        showToast("success", "Testimonial updated in PostgreSQL!");
      } else {
        await fetchApi("/testimonials", {
          method: "POST",
          body: JSON.stringify(form),
        });
        showToast("success", "Testimonial added to PostgreSQL!");
      }
      fetchItems();
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
    } catch (err: any) {
      showToast("error", err.message || "Failed to save testimonial");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetchApi(`/testimonials/${deleteId}`, { method: "DELETE" });
      showToast("success", "Testimonial deleted");
      setItems((prev) => prev.filter((t) => t.id !== deleteId));
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete testimonial");
    } finally {
      setDeleteId(null);
    }
  };

  const moveItem = async (id: string, direction: "up" | "down") => {
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= items.length) return;

    const reordered = [...items];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];

    const updates = reordered.map((item, i) => ({ ...item, displayOrder: i + 1 }));
    setItems(updates);

    try {
      for (const item of [updates[idx], updates[newIdx]]) {
        await fetchApi(`/testimonials/${item.id}`, {
          method: "PUT",
          body: JSON.stringify({ displayOrder: item.displayOrder }),
        });
      }
    } catch {
      // Ignore background sync errors
    }
  };

  if (loading) return <LoadingSpinner size="lg" label="Loading testimonials..." />;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="h-5 w-5 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900 font-heading">Testimonials Manager</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Add client reviews, upload speaker/alumni photos, and adjust display ordering.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition-all shadow-lg shadow-indigo-600/25 active:scale-95 self-start sm:self-center"
        >
          <Plus className="h-4 w-4" /> Add Testimonial
        </button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs overflow-y-auto">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 font-heading">
                  {editId ? "Edit Testimonial" : "Add Testimonial"}
                </h3>
                <p className="text-xs text-slate-500 font-medium">Enter quote, reviewer details, and upload avatar photo</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Sofia Rodriguez"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-bold text-slate-900 focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Role & Organization</label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="e.g. Founder, Ecos Col"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-medium text-slate-800 focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Photo Upload with ImageUploadField */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                <ImageUploadField
                  label="Reviewer Photo / Avatar"
                  value={form.photoPath}
                  onChange={(url) => setForm({ ...form, photoPath: url })}
                  category="testimonials"
                  helperText="Upload avatar headshot (PNG, JPG, WebP)"
                  aspectRatio="square"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quote / Review *</label>
                <textarea
                  value={form.quote}
                  onChange={(e) => setForm({ ...form, quote: e.target.value })}
                  rows={4}
                  placeholder="Paste the testimonial quote here..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-600 resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Rating (1-5 Stars)</label>
                  <select
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value, 10) || 5 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-indigo-600"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>
                        {r} Stars {"★".repeat(r)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Program</label>
                  <select
                    value={form.program}
                    onChange={(e) => setForm({ ...form, program: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-indigo-600"
                  >
                    <option value="exchange">Academic Exchange</option>
                    <option value="corporate">Corporate Excellence</option>
                    <option value="youth">Youth Leadership</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Region</label>
                  <input
                    type="text"
                    value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                    placeholder="South America, Europe"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors disabled:bg-slate-300"
              >
                {saving ? (
                  <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {editId ? "Update Testimonial" : "Create Testimonial"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials List */}
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md hover:border-indigo-200 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Order buttons */}
                <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                  <button
                    onClick={() => moveItem(item.id, "up")}
                    disabled={idx === 0}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-20"
                    title="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <span className="text-[10px] font-mono font-bold text-slate-400">{idx + 1}</span>
                  <button
                    onClick={() => moveItem(item.id, "down")}
                    disabled={idx === items.length - 1}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-20"
                    title="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>

                {/* Avatar */}
                <div className="h-12 w-12 rounded-2xl overflow-hidden bg-indigo-50 border border-slate-200 shrink-0">
                  {item.photoPath ? (
                    <img src={item.photoPath} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-indigo-400 font-bold">
                      {item.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900">{item.name}</h3>
                    <span className="text-xs text-slate-400 font-medium">({item.role})</span>
                    <div className="flex text-amber-400 text-xs">
                      {"★".repeat(item.rating || 5)}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                    &quot;{item.quote}&quot;
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                      {item.program}
                    </span>
                    {item.region && (
                      <span className="text-[10px] font-medium text-slate-400">
                        • {item.region}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => openEdit(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => setDeleteId(item.id)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete testimonial"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/70 p-8">
          <MessageSquareQuote className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <h3 className="text-sm font-bold text-slate-700">No testimonials yet</h3>
          <p className="text-xs text-slate-400 mt-1">Click &quot;Add Testimonial&quot; above to add your first student or partner quote.</p>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Testimonial"
        message="Are you sure you want to permanently delete this testimonial from the database?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
