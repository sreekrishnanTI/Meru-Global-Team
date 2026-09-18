"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { useToast } from "@/components/admin/Toast";

export default function AdminHistoryPage() {
    const { showToast } = useToast();
    const [data, setData] = useState<any>({ moments: [], milestones: [] });
    const [tab, setTab] = useState<"moments" | "milestones">("moments");
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ year: "", title: "", tag: "Event", description: "" });

    const load = () => fetchApi<any>("/history").then(setData).finally(() => setLoading(false));
    useEffect(() => { load().catch(() => setLoading(false)); }, []);

    const save = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            await fetchApi(`/history/${tab}`, { method: "POST", body: JSON.stringify(tab === "moments" ? form : { ...form, desc: form.description }) });
            setForm({ year: "", title: "", tag: "Event", description: "" });
            await load();
            showToast("success", `${tab === "moments" ? "Photo journal entry" : "Milestone"} saved`);
        } catch (error: any) { showToast("error", error.message || "Failed to save"); }
    };

    const remove = async (type: "moments" | "milestones", id: string) => {
        try { await fetchApi(`/history/${type}/${id}`, { method: "DELETE" }); await load(); }
        catch (error: any) { showToast("error", error.message || "Failed to delete"); }
    };

    if (loading) return <LoadingSpinner size="lg" label="Loading history manager..." />;
    const items = data[tab] || [];
    return <div className="space-y-6 pb-16">
        <header className="bg-white border border-slate-200 rounded-3xl p-6"><h1 className="text-2xl font-black text-slate-900 font-heading">Photo Journal & History</h1><p className="text-xs text-slate-500 mt-1">Manage public milestones and archival journal entries.</p></header>
        <div className="flex gap-2"><button onClick={() => setTab("moments")} className={`px-4 py-2 rounded-xl text-xs font-bold ${tab === "moments" ? "bg-blue-600 text-white" : "bg-white text-slate-600 border"}`}>Photo Journal</button><button onClick={() => setTab("milestones")} className={`px-4 py-2 rounded-xl text-xs font-bold ${tab === "milestones" ? "bg-blue-600 text-white" : "bg-white text-slate-600 border"}`}>Milestones</button></div>
        <form onSubmit={save} className="bg-white border border-slate-200 rounded-3xl p-6 grid gap-4 sm:grid-cols-2">
            <input required placeholder="Year" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className="border rounded-xl p-3 text-sm" />
            <input required placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="border rounded-xl p-3 text-sm" />
            {tab === "moments" && <input placeholder="Tag" value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} className="border rounded-xl p-3 text-sm" />}
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="border rounded-xl p-3 text-sm sm:col-span-2" />
            <button className="bg-blue-600 text-white rounded-xl p-3 text-sm font-bold sm:col-span-2">Add {tab === "moments" ? "Photo Journal Entry" : "Milestone"}</button>
        </form>
        <div className="grid gap-3">{items.map((item: any) => <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start justify-between gap-4"><div><span className="text-xs font-bold text-blue-600">{item.year}</span><h2 className="font-bold text-slate-900">{item.title}</h2><p className="text-xs text-slate-500 mt-1">{item.description || item.desc}</p></div><button onClick={() => remove(tab, String(item.id))} className="text-xs font-bold text-rose-600">Delete</button></div>)}</div>
    </div>;
}
