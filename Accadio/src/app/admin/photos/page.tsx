"use client";

import React, { useEffect, useState } from "react";
import {
  Trash2,
  Copy,
  Check,
  Maximize2,
  X,
  UploadCloud,
  Image as ImageIcon,
  FolderOpen,
  Filter,
} from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { fetchApi } from "@/lib/api";

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  type: "image" | "video";
  size: number;
  path: string;
  url: string;
  category: string;
  uploadedAt: string;
}

export default function AdminPhotosPage() {
  const { showToast } = useToast();
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchPhotos = () => {
    fetchApi<MediaItem[]>("/media?type=image")
      .then((data) => {
        setPhotos(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleUploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    formData.append("category", "images");

    try {
      await fetchApi("/media/upload", {
        method: "POST",
        body: formData,
      });
      showToast("success", `${files.length} photo(s) uploaded and indexed in database!`);
      fetchPhotos();
    } catch (err: any) {
      showToast("error", err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetchApi(`/media/${deleteId}`, { method: "DELETE" });
      showToast("success", "Photo deleted");
      setPhotos((prev) => prev.filter((p) => p.id !== deleteId));
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete photo");
    } finally {
      setDeleteId(null);
    }
  };

  const copyToClipboard = (path: string, id: string) => {
    navigator.clipboard.writeText(path);
    setCopiedId(id);
    showToast("info", `Copied "${path}" to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredPhotos = photos.filter((p) => {
    if (selectedCategory === "all") return true;
    return p.category === selectedCategory;
  });

  if (loading) return <LoadingSpinner size="lg" label="Loading media library..." />;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-sky-600" />
            <h1 className="text-2xl font-black text-slate-900 font-heading">Photos & Media Library</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Upload, preview, copy URLs, and manage all images stored in PostgreSQL and server storage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold cursor-pointer transition-all shadow-lg shadow-sky-600/25 active:scale-95">
            <UploadCloud className="h-4 w-4" />
            <span>Upload Photos</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && handleUploadFiles(e.target.files)}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files) handleUploadFiles(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-slate-200 hover:border-sky-500 rounded-3xl p-8 bg-slate-50/50 hover:bg-sky-50/20 text-center transition-all cursor-pointer group"
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.multiple = true;
          input.accept = "image/*";
          input.onchange = (e: any) => e.target.files && handleUploadFiles(e.target.files);
          input.click();
        }}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <span className="h-8 w-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-700">Uploading and indexing photos in database...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="p-4 rounded-2xl bg-white shadow-xs text-sky-600 mb-3 border border-slate-100 group-hover:scale-110 transition-transform">
              <UploadCloud className="h-8 w-8" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-800">
              Drag and drop multiple images here, or <span className="text-sky-600 underline">browse files</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">Supports PNG, JPG, WebP, SVG up to 50MB per batch</p>
          </div>
        )}
      </div>

      {/* Categories Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["all", "images", "programs", "testimonials", "general"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Photos Grid */}
      {filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="relative group rounded-2xl overflow-hidden border border-slate-200/80 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="aspect-square overflow-hidden bg-slate-100 relative">
                <img
                  src={photo.path || photo.url}
                  alt={photo.originalName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='2'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3C/svg%3E";
                  }}
                />

                {/* Hover overlay with action buttons */}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                  <button
                    onClick={() => setPreviewUrl(photo.path || photo.url)}
                    className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-800 shadow-md transition-transform hover:scale-110"
                    title="Fullscreen preview"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(photo.path || photo.url, photo.id)}
                    className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-800 shadow-md transition-transform hover:scale-110"
                    title="Copy relative path"
                  >
                    {copiedId === photo.id ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setDeleteId(photo.id)}
                    className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-transform hover:scale-110"
                    title="Delete image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-3 bg-white">
                <p className="text-[11px] font-bold text-slate-800 truncate" title={photo.originalName}>
                  {photo.originalName}
                </p>
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-medium">
                  <span>{formatSize(photo.size)}</span>
                  <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600">
                    {photo.category || "image"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/70 p-8">
          <ImageIcon className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <h3 className="text-sm font-bold text-slate-700">No photos in media library</h3>
          <p className="text-xs text-slate-400 mt-1">Upload images above to build your asset library.</p>
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <button
            onClick={() => setPreviewUrl(null)}
            className="absolute top-6 right-6 p-2 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl">
            <img src={previewUrl} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-white text-xs px-3 py-1 rounded-lg font-mono">
              {previewUrl}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Photo"
        message="Are you sure you want to permanently delete this photo from the storage and database?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
