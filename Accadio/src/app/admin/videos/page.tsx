"use client";

import React, { useEffect, useState } from "react";
import { Video, Plus, Trash2, Copy, Check, UploadCloud, Play, ExternalLink } from "lucide-react";
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
  uploadedAt: string;
}

export default function AdminVideosPage() {
  const { showToast } = useToast();
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchVideos = () => {
    fetchApi<MediaItem[]>("/media?type=video")
      .then((data) => {
        setVideos(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("files", file);
    formData.append("category", "videos");

    try {
      await fetchApi("/media/upload", {
        method: "POST",
        body: formData,
      });
      showToast("success", "Video uploaded successfully!");
      fetchVideos();
    } catch (err: any) {
      showToast("error", err.message || "Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetchApi(`/media/${deleteId}`, { method: "DELETE" });
      showToast("success", "Video deleted");
      setVideos((prev) => prev.filter((v) => v.id !== deleteId));
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete video");
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

  if (loading) return <LoadingSpinner size="lg" label="Loading video library..." />;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-purple-600" />
            <h1 className="text-2xl font-black text-slate-900 font-heading">Videos Manager</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Upload MP4 video assets or manage video files for hero sections and testimonial showcases.
          </p>
        </div>

        <label className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold cursor-pointer transition-all shadow-lg shadow-purple-600/25 active:scale-95 self-start sm:self-center">
          <UploadCloud className="h-4 w-4" />
          <span>{uploading ? "Uploading Video..." : "Upload MP4"}</span>
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={(e) => e.target.files && e.target.files[0] && handleUpload(e.target.files[0])}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Videos List */}
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div className="aspect-video bg-slate-900 relative">
                <video src={vid.path || vid.url} controls className="w-full h-full object-cover" />
              </div>

              <div className="p-5 flex items-center justify-between gap-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-800 truncate" title={vid.originalName}>
                  {vid.originalName}
                </p>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => copyToClipboard(vid.path || vid.url, vid.id)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Copy path"
                  >
                    {copiedId === vid.id ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setDeleteId(vid.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete video"
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
          <Video className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <h3 className="text-sm font-bold text-slate-700">No videos uploaded yet</h3>
          <p className="text-xs text-slate-400 mt-1">Click &quot;Upload MP4&quot; above to upload your first video file.</p>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Video"
        message="Are you sure you want to permanently delete this video file from the database?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
