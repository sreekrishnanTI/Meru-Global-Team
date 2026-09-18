"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { useToast } from "@/components/admin/Toast";

export default function AdminNewsPage() {
    const { showToast } = useToast();
    const [data, setData] = useState<any>({ articles: [], events: [] });
    const [tab, setTab] = useState<"articles" | "events">("articles");
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ title: "", date: "", category: "Announcement", day: "", month: "", time: "", location: "", desc: "" });

    const load = () => fetchApi<any>("/news").then(setData).finally(() => setLoading(false));
    useEffect(() => { load().catch(() => setLoading(false)); }, []);

    const save = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            await fetchApi(`/news/${tab}`, { method: "POST", body: JSON.stringify(form) });
            setForm({ title: "", date: "", category: "Announcement", day: "", month: "", time: "", location: "", desc: "" });
            await load();
            showToast("success", `${tab === "articles" ? "Article" : "Event"} saved`);
        } catch (error: any) { showToast("error", error.message || "Failed to save"); }
    };

    const remove = async (id: string) => {
        try { await fetchApi(`/news/${tab}/${id}`, { method: "DELETE" }); await load(); }
        catch (error: any) { showToast("error", error.message || "Failed to delete"); }
    };

    if (loading) return <LoadingSpinner size="lg" label="Loading news manager..." />;
    const items = data[tab] || [];
    return <div className="space-y-6 pb-16">
        <header className="bg-white border border-slate-200 rounded-3xl p-6"><h1 className="text-2xl font-black text-slate-900 font-heading">News & Press</h1><p className="text-xs text-slate-500 mt-1">Manage announcements and upcoming events shown on the public portal.</p></header>
        <div className="flex gap-2"><button onClick={() => setTab("articles")} className={`px-4 py-2 rounded-xl text-xs font-bold ${tab === "articles" ? "bg-blue-600 text-white" : "bg-white text-slate-600 border"}`}>Announcements</button><button onClick={() => setTab("events")} className={`px-4 py-2 rounded-xl text-xs font-bold ${tab === "events" ? "bg-blue-600 text-white" : "bg-white text-slate-600 border"}`}>Events</button></div>
        <form onSubmit={save} className="bg-white border border-slate-200 rounded-3xl p-6 grid gap-4 sm:grid-cols-2">
            <input required placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="border rounded-xl p-3 text-sm sm:col-span-2" />
            {tab === "articles" ? <><input required placeholder="Publication date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="border rounded-xl p-3 text-sm" /><input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="border rounded-xl p-3 text-sm" /></> : <><input required placeholder="Day" value={form.day} onChange={e => setForm({ ...form, day: e.target.value })} className="border rounded-xl p-3 text-sm" /><input required placeholder="Month" value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} className="border rounded-xl p-3 text-sm" /><input placeholder="Time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="border rounded-xl p-3 text-sm" /><input placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="border rounded-xl p-3 text-sm" /></>}
            <textarea placeholder={tab === "articles" ? "Excerpt" : "Description"} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} className="border rounded-xl p-3 text-sm sm:col-span-2" />
            <button className="bg-blue-600 text-white rounded-xl p-3 text-sm font-bold sm:col-span-2">Add {tab === "articles" ? "Announcement" : "Event"}</button>
        </form>
        <div className="grid gap-3">{items.map((item: any) => <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start justify-between gap-4"><div><span className="text-xs font-bold text-blue-600">{tab === "articles" ? item.date : `${item.day} ${item.month}`}</span><h2 className="font-bold text-slate-900">{item.title}</h2><p className="text-xs text-slate-500 mt-1">{item.desc}</p></div><button onClick={() => remove(String(item.id))} className="text-xs font-bold text-rose-600">Delete</button></div>)}</div>
    </div>;
}
