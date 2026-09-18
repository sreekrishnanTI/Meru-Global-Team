"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Calendar,
  GraduationCap,
  Search,
  MapPin,
  CheckCircle2,
  ListPlus,
  Compass,
} from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { fetchApi } from "@/lib/api";

interface Program {
  id: string;
  name: string;
  category: string;
  tag: string;
  description: string;
  eligibility: string;
  benefits: string[];
  date: string;
  location: string;
  featuredImagePath: string;
  active: boolean;
  createdAt: string;
}

const emptyForm = {
  name: "",
  category: "exchange",
  tag: "Academic Exchange",
  description: "",
  eligibility: "",
  benefits: ["Academic certificate upon completion", "Dedicated mentorship"],
  date: "",
  location: "",
  featuredImagePath: "",
  active: true,
};

export default function AdminProgramsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newBenefit, setNewBenefit] = useState("");

  const fetchItems = () => {
    fetchApi<Program[]>("/programs")
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

  const openEdit = (item: Program) => {
    setEditId(item.id);
    setForm({
      name: item.name,
      category: item.category || "exchange",
      tag: item.tag || "Academic Exchange",
      description: item.description || "",
      eligibility: item.eligibility || "",
      benefits: Array.isArray(item.benefits) ? item.benefits : [],
      date: item.date || "",
      location: item.location || "",
      featuredImagePath: item.featuredImagePath || "",
      active: item.active !== false,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name) {
      showToast("error", "Program name is required");
      return;
    }
    setSaving(true);

    try {
      if (editId) {
        await fetchApi(`/programs/${editId}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        showToast("success", "Program updated successfully in PostgreSQL!");
      } else {
        await fetchApi("/programs", {
          method: "POST",
          body: JSON.stringify(form),
        });
        showToast("success", "Program created successfully in PostgreSQL!");
      }
      fetchItems();
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
    } catch (err: any) {
      showToast("error", err.message || "Failed to save program");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetchApi(`/programs/${deleteId}`, { method: "DELETE" });
      showToast("success", "Program deleted");
      setItems((prev) => prev.filter((p) => p.id !== deleteId));
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete program");
    } finally {
      setDeleteId(null);
    }
  };

  const addBenefit = () => {
    if (!newBenefit.trim()) return;
    setForm({ ...form, benefits: [...form.benefits, newBenefit.trim()] });
    setNewBenefit("");
  };

  const removeBenefit = (idx: number) => {
    const updated = [...form.benefits];
    updated.splice(idx, 1);
    setForm({ ...form, benefits: updated });
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tag?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) return <LoadingSpinner size="lg" label="Loading programs catalog..." />;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            <h1 className="text-2xl font-black text-slate-900 font-heading">Programs Manager</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Create, update, and upload featured images for global training programs and exchange seminars.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition-all shadow-lg shadow-blue-600/25 active:scale-95 self-start sm:self-center"
        >
          <Plus className="h-4 w-4" /> Add Program
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Programs" },
            { id: "exchange", label: "Academic Exchange" },
            { id: "corporate", label: "Corporate Excellence" },
            { id: "youth", label: "Youth Leadership" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search programs..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-600"
          />
        </div>
      </div>

      {/* Program Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs overflow-y-auto">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 font-heading">
                  {editId ? "Edit Program" : "Add New Program"}
                </h3>
                <p className="text-xs text-slate-500 font-medium">Enter course details and upload a featured photo</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Program Title *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Global Exchange Seminar (Tokyo)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-600"
                  >
                    <option value="exchange">Academic Exchange</option>
                    <option value="corporate">Corporate Excellence</option>
                    <option value="youth">Youth Leadership</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Badge Tag</label>
                  <input
                    type="text"
                    value={form.tag}
                    onChange={(e) => setForm({ ...form, tag: e.target.value })}
                    placeholder="Academic Exchange"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Integrated Image Upload Widget */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                <ImageUploadField
                  label="Featured Program Image (Direct File Upload)"
                  value={form.featuredImagePath}
                  onChange={(url) => setForm({ ...form, featuredImagePath: url })}
                  category="programs"
                  helperText="Drop or browse a high-res photo for this program"
                  aspectRatio="video"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Program Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Provide an overview of the curriculum and benefits..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-600 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Eligibility Criteria</label>
                <input
                  type="text"
                  value={form.eligibility}
                  onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
                  placeholder="Enrolled university students or recent graduates..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              {/* Benefits list */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Key Benefits / Highlights</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addBenefit();
                      }
                    }}
                    placeholder="e.g. 8 ECTS Academic Credits"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {form.benefits.map((b, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                    >
                      <CheckCircle2 className="h-3 w-3 text-blue-600" />
                      {b}
                      <button
                        type="button"
                        onClick={() => removeBenefit(idx)}
                        className="hover:text-rose-600 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Event / Start Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Tokyo, Japan or London & Hybrid"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-600"
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
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors disabled:bg-slate-300"
              >
                {saving ? (
                  <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {editId ? "Update Program" : "Create Program"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Programs Catalog Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  {item.featuredImagePath ? (
                    <img
                      src={item.featuredImagePath}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='2'%3E%3Cpath d='M22 10v6M2 10l10-5 10 5-10 5z'/%3E%3Cpath d='M6 12v5c3 3 9 3 12 0v-5'/%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                      <GraduationCap className="h-12 w-12 text-blue-300" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-white">
                    {item.tag || item.category}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="text-base font-black text-slate-900 line-clamp-1">{item.name}</h3>

                  <div className="flex flex-wrap items-center gap-3 text-slate-400 text-xs">
                    {item.date && (
                      <span className="flex items-center gap-1 font-semibold text-blue-600">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    )}
                    {item.location && (
                      <span className="flex items-center gap-1 font-semibold">
                        <MapPin className="h-3.5 w-3.5" />
                        {item.location}
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 font-medium leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    onClick={() => openEdit(item)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit Program
                  </button>
                  <button
                    onClick={() => setDeleteId(item.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete program"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/70 p-8">
          <GraduationCap className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <h3 className="text-sm font-bold text-slate-700">No programs found</h3>
          <p className="text-xs text-slate-400 mt-1">Try changing your search filter or click &quot;Add Program&quot; above.</p>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Program"
        message="Are you sure you want to permanently delete this program from the database?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
