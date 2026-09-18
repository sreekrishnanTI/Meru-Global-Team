"use client";

import React, { useEffect, useState } from "react";
import {
  Save,
  Mail,
  Phone,
  MapPin,
  Clock,
  Share2,
  Inbox,
  CheckCircle2,
  Trash2,
  Eye,
  X,
  Send,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { fetchApi } from "@/lib/api";

interface ContactData {
  phone: string;
  email: string;
  address: string;
  officeHours: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
  googleMapsEmbed: string;
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  message: string;
  status: "unread" | "read" | "replied";
  createdAt: string;
}

export default function AdminContactPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"settings" | "inbox">("settings");
  const [contact, setContact] = useState<ContactData | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [deleteInquiryId, setDeleteInquiryId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const loadData = () => {
    Promise.all([
      fetchApi<ContactData>("/contact").catch(() => null),
      fetchApi<Inquiry[]>("/contact/inquiries").catch(() => []),
    ])
      .then(([c, inqs]) => {
        if (c) setContact(c);
        if (Array.isArray(inqs)) setInquiries(inqs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveContact = async () => {
    if (!contact) return;
    setSaving(true);
    try {
      await fetchApi("/contact", {
        method: "PUT",
        body: JSON.stringify(contact),
      });
      showToast("success", "Contact settings updated successfully!");
    } catch (err: any) {
      showToast("error", err.message || "Failed to save contact settings");
    } finally {
      setSaving(false);
    }
  };

  const updateInquiryStatus = async (id: string, status: string) => {
    try {
      await fetchApi(`/contact/inquiries/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setInquiries((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: status as any } : i))
      );
      if (selectedInquiry?.id === id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, status: status as any } : null));
      }
      showToast("success", `Marked as ${status}`);
    } catch (err: any) {
      showToast("error", err.message || "Failed to update status");
    }
  };

  const handleDeleteInquiry = async () => {
    if (!deleteInquiryId) return;
    try {
      await fetchApi(`/contact/inquiries/${deleteInquiryId}`, { method: "DELETE" });
      setInquiries((prev) => prev.filter((i) => i.id !== deleteInquiryId));
      if (selectedInquiry?.id === deleteInquiryId) setSelectedInquiry(null);
      showToast("success", "Inquiry deleted");
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete");
    } finally {
      setDeleteInquiryId(null);
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    if (statusFilter === "all") return true;
    return inq.status === statusFilter;
  });

  const unreadCount = inquiries.filter((i) => i.status === "unread").length;

  if (loading) return <LoadingSpinner size="lg" label="Loading contact manager..." />;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-blue-600" />
            <h1 className="text-2xl font-black text-slate-900 font-heading">Contact & Inquiries</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage organization contact channels and view real messages submitted by website visitors.
          </p>
        </div>

        {activeTab === "settings" && (
          <button
            onClick={handleSaveContact}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition-all shadow-lg shadow-blue-600/25 active:scale-95 disabled:bg-slate-300 self-start sm:self-center"
          >
            {saving ? (
              <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Contact Settings
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === "settings"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Contact Information & Socials
        </button>
        <button
          onClick={() => setActiveTab("inbox")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === "inbox"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Inbox className="h-4 w-4" />
          Inquiries Inbox
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: CONTACT SETTINGS */}
      {activeTab === "settings" && contact && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-extrabold text-slate-900 font-heading">Primary Contact Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Direct Phone</label>
                <input
                  type="text"
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Official Email</label>
                <input
                  type="email"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Headquarters Address</label>
                <input
                  type="text"
                  value={contact.address}
                  onChange={(e) => setContact({ ...contact, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-semibold text-slate-800 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Office Hours</label>
                <input
                  type="text"
                  value={contact.officeHours}
                  onChange={(e) => setContact({ ...contact, officeHours: e.target.value })}
                  placeholder="Mon - Fri: 9:00 AM - 6:00 PM"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-semibold text-slate-800 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800">Official Social Media URLs</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {["facebook", "twitter", "instagram", "linkedin", "youtube"].map((net) => (
                  <div key={net} className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">{net}</label>
                    <input
                      type="text"
                      value={(contact.socialLinks as any)[net] || ""}
                      onChange={(e) =>
                        setContact({
                          ...contact,
                          socialLinks: { ...contact.socialLinks, [net]: e.target.value },
                        })
                      }
                      placeholder={`https://${net}.com/...`}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-600"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Google Maps Embed URL</label>
              <textarea
                rows={2}
                value={contact.googleMapsEmbed}
                onChange={(e) => setContact({ ...contact, googleMapsEmbed: e.target.value })}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-700 focus:outline-hidden focus:border-blue-600 resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INQUIRIES INBOX */}
      {activeTab === "inbox" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex gap-2">
              {["all", "unread", "read", "replied"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                    statusFilter === st ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-400 font-bold">{filteredInquiries.length} total</span>
          </div>

          {filteredInquiries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInquiries.map((inq) => (
                <div
                  key={inq.id}
                  onClick={() => {
                    setSelectedInquiry(inq);
                    if (inq.status === "unread") updateInquiryStatus(inq.id, "read");
                  }}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer bg-white ${
                    inq.status === "unread"
                      ? "border-blue-400 shadow-md ring-1 ring-blue-400/20"
                      : "border-slate-200/80 hover:border-slate-300 shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{inq.name}</h4>
                      <p className="text-xs text-slate-400 font-medium">{inq.email}</p>
                    </div>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        inq.status === "unread"
                          ? "bg-rose-50 text-rose-600"
                          : inq.status === "replied"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {inq.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3">
                    {inq.message}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    <span>Dept: {inq.department || "General"}</span>
                    <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/70 p-8">
              <Inbox className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <h3 className="text-sm font-bold text-slate-700">No inquiries match filter</h3>
              <p className="text-xs text-slate-400 mt-1">Website contact submissions will be displayed here.</p>
            </div>
          )}
        </div>
      )}

      {/* Inquiry Detail Drawer / Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">
                  Inquiry Details
                </span>
                <h3 className="text-xl font-black text-slate-900 font-heading">{selectedInquiry.name}</h3>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p className="text-slate-500 font-semibold">
                  <strong className="text-slate-800">Email:</strong> {selectedInquiry.email}
                </p>
                {selectedInquiry.phone && (
                  <p className="text-slate-500 font-semibold">
                    <strong className="text-slate-800">Phone:</strong> {selectedInquiry.phone}
                  </p>
                )}
                <p className="text-slate-500 font-semibold">
                  <strong className="text-slate-800">Department:</strong> {selectedInquiry.department}
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Message</label>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-800 text-xs leading-relaxed font-medium">
                  {selectedInquiry.message}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setDeleteInquiryId(selectedInquiry.id)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <div className="flex gap-2">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Reply to your Inquiry&body=Hi ${encodeURIComponent(
                    selectedInquiry.name
                  )},%0A%0AThank you for reaching out to Meru Organisation.`}
                  onClick={() => updateInquiryStatus(selectedInquiry.id, "replied")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                >
                  <Send className="h-3.5 w-3.5" /> Reply by Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteInquiryId !== null}
        title="Delete Inquiry"
        message="Are you sure you want to permanently delete this inquiry record?"
        onConfirm={handleDeleteInquiry}
        onCancel={() => setDeleteInquiryId(null)}
      />
    </div>
  );
}
