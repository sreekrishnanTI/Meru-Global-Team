"use client";

import React, { useEffect, useState } from "react";
import {
  Save,
  Plus,
  Trash2,
  GripVertical,
  Sparkles,
  Award,
  Layers,
  BarChart3,
  Globe,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { fetchApi } from "@/lib/api";

interface TickerItem {
  id: string;
  label: string;
  date: string;
  text: string;
  color: string;
}

interface StatItem {
  id?: string;
  target: number;
  suffix: string;
  label: string;
}

interface ValueItem {
  id?: string;
  title: string;
  desc: string;
  icon: string;
}

interface HomepageData {
  heroTitle: string;
  heroSubtitle: string;
  heroImagePath: string;
  heroVideoUrl: string;
  logoRotation: boolean;
  aboutTitle: string;
  aboutSubtitle: string;
  aboutOverview: string;
  aboutMissionTitle: string;
  aboutMissionText: string;
  aboutVisionTitle: string;
  aboutVisionText: string;
  donationTitle: string;
  donationSubtitle: string;
  tickerItems: TickerItem[];
  stats: StatItem[];
  values: ValueItem[];
}

const COLORS = ["blue", "emerald", "purple", "amber", "rose", "sky"];
const ICONS = ["Users", "Award", "HeartHandshake", "ShieldCheck", "Compass", "Sparkles"];

export default function AdminHomepagePage() {
  const { showToast } = useToast();
  const [data, setData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"hero" | "ticker" | "about" | "stats" | "values">("hero");

  useEffect(() => {
    let cancelled = false;
    const load = async (attempt = 0): Promise<void> => {
      try {
        const loaded = await fetchApi<HomepageData>("/homepage");
        if (!cancelled) {
          setData(loaded);
          setLoading(false);
        }
      } catch (err) {
        if (attempt < 2) {
          window.setTimeout(() => void load(attempt + 1), 600 * (attempt + 1));
          return;
        }
        console.error(err);
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      await fetchApi("/homepage", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      showToast("success", "Homepage changes saved and synchronized with database!");
    } catch (err: any) {
      showToast("error", err.message || "Failed to save homepage settings");
    } finally {
      setSaving(false);
    }
  };

  // Ticker management
  const addTickerItem = () => {
    if (!data) return;
    const newItem: TickerItem = {
      id: Date.now().toString(),
      label: "NEWS",
      date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase(),
      text: "New milestone or event announcement.",
      color: COLORS[data.tickerItems.length % COLORS.length],
    };
    setData({ ...data, tickerItems: [...data.tickerItems, newItem] });
  };

  const removeTickerItem = (id: string) => {
    if (!data) return;
    setData({ ...data, tickerItems: data.tickerItems.filter((t) => t.id !== id) });
  };

  const updateTickerItem = (id: string, field: keyof TickerItem, value: string) => {
    if (!data) return;
    setData({
      ...data,
      tickerItems: data.tickerItems.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    });
  };

  // Stats management
  const addStatItem = () => {
    if (!data) return;
    const newStat: StatItem = {
      id: Date.now().toString(),
      target: 100,
      suffix: "+",
      label: "New Metric",
    };
    setData({ ...data, stats: [...(data.stats || []), newStat] });
  };

  const removeStatItem = (index: number) => {
    if (!data || !data.stats) return;
    const updated = [...data.stats];
    updated.splice(index, 1);
    setData({ ...data, stats: updated });
  };

  const updateStatItem = (index: number, field: keyof StatItem, value: any) => {
    if (!data || !data.stats) return;
    const updated = [...data.stats];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, stats: updated });
  };

  // Values management
  const updateValueItem = (index: number, field: keyof ValueItem, value: string) => {
    if (!data || !data.values) return;
    const updated = [...data.values];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, values: updated });
  };

  if (loading) return <LoadingSpinner size="lg" label="Loading homepage manager..." />;
  if (!data) return <p className="text-sm text-red-500">Failed to load homepage settings.</p>;

  return (
    <div className="space-y-8 pb-16">
      {/* Header with Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs sticky top-4 z-20">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
            <h1 className="text-2xl font-black text-slate-900 font-heading">Homepage Content Studio</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Changes saved here are directly stored in PostgreSQL and live immediately on the website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Preview Live
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all disabled:bg-slate-300 shadow-lg shadow-blue-600/25 active:scale-95"
          >
            {saving ? (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save & Publish
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { id: "hero", label: "1. Hero Section & Image", icon: Globe },
          { id: "ticker", label: "2. News & Updates Ticker", icon: Sparkles },
          { id: "about", label: "3. About, Mission & Vision", icon: Layers },
          { id: "stats", label: "4. Live Stats Counters", icon: BarChart3 },
          { id: "values", label: "5. Core Values", icon: Award },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${activeTab === tab.id
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
          >
            <tab.icon className="h-4 w-4 shrink-0" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: HERO SECTION */}
      {activeTab === "hero" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 font-heading">Hero Title & Messaging</h2>
              <p className="text-xs text-slate-500 font-medium">Controls the primary tagline and intro visible at the top of the homepage.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Hero Headline</label>
                <input
                  type="text"
                  value={data.heroTitle}
                  onChange={(e) => setData({ ...data, heroTitle: e.target.value })}
                  placeholder="Reaching the Unreached"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm text-slate-900 font-bold focus:outline-hidden focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Hero Subtitle</label>
                <input
                  type="text"
                  value={data.heroSubtitle}
                  onChange={(e) => setData({ ...data, heroSubtitle: e.target.value })}
                  placeholder="Connecting generations to the Great Commission"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm text-slate-900 font-bold focus:outline-hidden focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-sm font-extrabold text-slate-800 mb-2">Hero Visuals & Media Upload</h3>
              <p className="text-xs text-slate-500 mb-4">
                Upload a custom background banner or set a background video URL. If left blank, the dynamic 3D interactive globe is rendered.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <ImageUploadField
                  label="Hero Banner Image"
                  value={data.heroImagePath}
                  onChange={(path) => setData({ ...data, heroImagePath: path })}
                  category="images"
                  helperText="Recommended: 1920x1080 WebP or PNG"
                  aspectRatio="video"
                />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Background Video URL (Optional)</label>
                    <input
                      type="text"
                      value={data.heroVideoUrl}
                      onChange={(e) => setData({ ...data, heroVideoUrl: e.target.value })}
                      placeholder="https://youtube.com/... or /uploads/videos/hero.mp4"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm text-slate-900 font-semibold focus:outline-hidden focus:border-blue-600 focus:bg-white"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-blue-900">3D Interactive Globe Animation</h4>
                      <p className="text-[11px] text-blue-700">Allow visitors to rotate the 3D globe in the hero section</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.logoRotation}
                        onChange={(e) => setData({ ...data, logoRotation: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NEWS & UPDATES TICKER */}
      {activeTab === "ticker" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 font-heading">Live News & Updates Ticker</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Add, update, or remove headline items displayed in the infinite ticker banner on the homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={addTickerItem}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors self-start"
              >
                <Plus className="h-4 w-4" /> Add Ticker News
              </button>
            </div>

            <div className="space-y-3">
              {data.tickerItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row items-start md:items-center gap-3 p-4 rounded-2xl border border-slate-200/70 bg-slate-50/50 hover:bg-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-slate-300 shrink-0" />
                    <span className="text-[11px] font-mono text-slate-400 font-bold">#{idx + 1}</span>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3 w-full">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Badge Tag</label>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => updateTickerItem(item.id, "label", e.target.value)}
                        placeholder="EVENT, MILESTONE"
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-extrabold text-slate-800 uppercase focus:outline-hidden focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Date</label>
                      <input
                        type="text"
                        value={item.date}
                        onChange={(e) => updateTickerItem(item.id, "date", e.target.value)}
                        placeholder="JUNE 2026"
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 uppercase focus:outline-hidden focus:border-blue-600"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">News Text</label>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => updateTickerItem(item.id, "text", e.target.value)}
                        placeholder="Enter announcement text..."
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Color</label>
                      <select
                        value={item.color}
                        onChange={(e) => updateTickerItem(item.id, "color", e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-600"
                      >
                        {COLORS.map((c) => (
                          <option key={c} value={c}>
                            {c.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeTickerItem(item.id)}
                      className="p-2 mt-4 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {data.tickerItems.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-xs font-semibold">No ticker items added yet. Click &quot;Add Ticker News&quot; above.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ABOUT, MISSION & VISION */}
      {activeTab === "about" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 font-heading">About Us Narrative Section</h2>
              <p className="text-xs text-slate-500 font-medium">Edit the title, subtitle, and detailed overview shown on the home page.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">About Section Badge</label>
                <input
                  type="text"
                  value={data.aboutSubtitle}
                  onChange={(e) => setData({ ...data, aboutSubtitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm text-slate-900 font-bold focus:outline-hidden focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Main Headline</label>
                <input
                  type="text"
                  value={data.aboutTitle}
                  onChange={(e) => setData({ ...data, aboutTitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm text-slate-900 font-bold focus:outline-hidden focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Overview Paragraph</label>
              <textarea
                rows={4}
                value={data.aboutOverview}
                onChange={(e) => setData({ ...data, aboutOverview: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 font-medium leading-relaxed focus:outline-hidden focus:border-blue-600 focus:bg-white resize-none"
              />
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-sm font-extrabold text-slate-800 mb-4">Mission & Vision Feature Cards</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Mission */}
                <div className="p-5 rounded-2xl border border-blue-100 bg-blue-50/30 space-y-3">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Mission Card</span>
                  <input
                    type="text"
                    value={data.aboutMissionTitle}
                    onChange={(e) => setData({ ...data, aboutMissionTitle: e.target.value })}
                    placeholder="Our Mission"
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm font-extrabold text-slate-800"
                  />
                  <textarea
                    rows={3}
                    value={data.aboutMissionText}
                    onChange={(e) => setData({ ...data, aboutMissionText: e.target.value })}
                    placeholder="Mission statement..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-700 resize-none"
                  />
                </div>

                {/* Vision */}
                <div className="p-5 rounded-2xl border border-purple-100 bg-purple-50/30 space-y-3">
                  <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block">Vision Card</span>
                  <input
                    type="text"
                    value={data.aboutVisionTitle}
                    onChange={(e) => setData({ ...data, aboutVisionTitle: e.target.value })}
                    placeholder="Our Vision"
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm font-extrabold text-slate-800"
                  />
                  <textarea
                    rows={3}
                    value={data.aboutVisionText}
                    onChange={(e) => setData({ ...data, aboutVisionText: e.target.value })}
                    placeholder="Vision statement..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-700 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Donation Banner Controls */}
            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-sm font-extrabold text-slate-800 mb-2">Donation Banner Messaging</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Donation Headline</label>
                  <input
                    type="text"
                    value={data.donationTitle}
                    onChange={(e) => setData({ ...data, donationTitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Donation Subtitle</label>
                  <input
                    type="text"
                    value={data.donationSubtitle}
                    onChange={(e) => setData({ ...data, donationSubtitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-medium text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE STATS COUNTERS */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 font-heading">Interactive Animated Counters</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Control the statistics that automatically count up when a user scrolls into the About section.
                </p>
              </div>
              <button
                type="button"
                onClick={addStatItem}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors self-start"
              >
                <Plus className="h-4 w-4" /> Add Stat Counter
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(data.stats || []).map((stat, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Metric #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeStatItem(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete counter"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Target Number</label>
                      <input
                        type="number"
                        value={stat.target}
                        onChange={(e) => updateStatItem(idx, "target", parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-base font-extrabold text-blue-600"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Suffix</label>
                      <input
                        type="text"
                        value={stat.suffix}
                        onChange={(e) => updateStatItem(idx, "suffix", e.target.value)}
                        placeholder="+, %, K"
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-base font-extrabold text-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Label</label>
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => updateStatItem(idx, "label", e.target.value)}
                      placeholder="Countries Active"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-700"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CORE VALUES */}
      {activeTab === "values" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 font-heading">Core Values Grid</h2>
              <p className="text-xs text-slate-500 font-medium">Edit the values, titles, and descriptions highlighted in the summary section.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(data.values || []).map((val, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600">Value #{idx + 1}</span>
                    <select
                      value={val.icon}
                      onChange={(e) => updateValueItem(idx, "icon", e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg py-1 px-2 text-xs font-bold text-slate-700"
                    >
                      {ICONS.map((ic) => (
                        <option key={ic} value={ic}>{ic}</option>
                      ))}
                    </select>
                  </div>

                  <input
                    type="text"
                    value={val.title}
                    onChange={(e) => updateValueItem(idx, "title", e.target.value)}
                    placeholder="Value Title"
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm font-bold text-slate-900"
                  />

                  <textarea
                    rows={2}
                    value={val.desc}
                    onChange={(e) => updateValueItem(idx, "desc", e.target.value)}
                    placeholder="Short description..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-600 resize-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
