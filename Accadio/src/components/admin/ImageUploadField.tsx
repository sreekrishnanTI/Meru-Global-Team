"use client";

import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, Image as ImageIcon, Trash2, Check, RefreshCw, FolderOpen, X, AlertCircle } from "lucide-react";
import { uploadMediaFile, fetchApi } from "@/lib/api";

interface ImageUploadFieldProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  category?: "images" | "programs" | "testimonials" | "videos" | "general";
  helperText?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "wide" | "auto";
}

export default function ImageUploadField({
  label = "Upload Image",
  value,
  onChange,
  category = "images",
  helperText = "PNG, JPG, WebP or SVG up to 10MB",
  className = "",
  aspectRatio = "wide",
}: ImageUploadFieldProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [existingMedia, setExistingMedia] = useState<Array<{ id: string; url: string; path: string; originalName: string }>>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file (PNG, JPG, WebP, SVG)");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const res = await uploadMediaFile(file, category);
      if (res.url || res.path) {
        // Prefer relative path for frontend portability
        onChange(res.path || res.url);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to upload image. Make sure backend is running.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const openMediaPicker = async () => {
    setShowMediaPicker(true);
    setLoadingMedia(true);
    try {
      const media = await fetchApi<any[]>("/media?type=image");
      setExistingMedia(media || []);
    } catch {
      setExistingMedia([]);
    } finally {
      setLoadingMedia(false);
    }
  };

  const aspectClass = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "h-48 w-full",
    auto: "min-h-[160px] w-full",
  }[aspectRatio];

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        {label && <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</label>}
        <button
          type="button"
          onClick={openMediaPicker}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          <FolderOpen className="h-3.5 w-3.5" /> Browse Library
        </button>
      </div>

      {/* Main Preview or Upload Box */}
      {value ? (
        <div className={`relative group rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50 ${aspectClass}`}>
          <img
            src={value}
            alt="Uploaded Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              // fallback placeholder if local image broken
              (e.currentTarget as HTMLImageElement).src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
            }}
          />

          {/* Hover actions overlay */}
          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-white/90 hover:bg-white text-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Replace
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          </div>

          <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-xs text-[10px] text-white font-mono truncate max-w-[80%]">
            {value}
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
            isDragging
              ? "border-blue-500 bg-blue-50/50 scale-[0.99]"
              : "border-slate-200 hover:border-blue-400 bg-slate-50/60 hover:bg-slate-50"
          } ${aspectClass}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3 text-blue-600">
              <span className="h-8 w-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-700">Uploading & optimizing...</p>
            </div>
          ) : (
            <>
              <div className="p-3 rounded-2xl bg-white shadow-xs text-blue-600 mb-3 border border-slate-100 group-hover:scale-110 transition-transform">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-800 text-center">
                Drag & drop image here, or <span className="text-blue-600 underline">browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">{helperText}</p>
            </>
          )}
        </div>
      )}

      {uploadError && (
        <p className="text-xs text-rose-500 font-semibold flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" /> {uploadError}
        </p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/svg+xml, image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Media Library Picker Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-heading">Choose from Media Library</h3>
                <p className="text-xs text-slate-500 font-medium">Select an image already uploaded to your database</p>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaPicker(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-1">
              {loadingMedia ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <span className="h-7 w-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-xs font-semibold">Loading media library...</p>
                </div>
              ) : existingMedia.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {existingMedia.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => {
                        onChange(item.path || item.url);
                        setShowMediaPicker(false);
                      }}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 hover:border-blue-500 hover:ring-2 hover:ring-blue-500/20 transition-all bg-slate-100 focus:outline-hidden"
                    >
                      <img src={item.path || item.url} alt={item.originalName} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-blue-600/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Check className="h-6 w-6 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400">
                  <ImageIcon className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">No images in media library yet.</p>
                  <p className="text-[11px] mt-1">Upload an image directly using the drop area.</p>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMediaPicker(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
