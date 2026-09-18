"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, ChevronDown, ChevronUp, Download, Check, Sparkles, BookOpen, Users, Compass, Landmark } from "lucide-react";

function ProgramsCatalog() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Retrieve initial category filter from URL (useful for mega menu links)
  const initialCat = searchParams.get("cat") || "all";

  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state if search params change
  useEffect(() => {
    const cat = searchParams.get("cat") || "all";
    setActiveCategory(cat);
  }, [searchParams]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    // Update URL query string
    if (cat === "all") {
      router.push("/programs");
    } else {
      router.push(`/programs?cat=${cat}`);
    }
  };

  const triggerDownload = (programTitle: string) => {
    setToastMessage(`Starting download: Brochure_${programTitle.replace(/\s+/g, "_")}.pdf`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Programs catalog
  const defaultPrograms = [
    {
      id: 1,
      title: "Global Exchange Seminar (Tokyo)",
      category: "exchange",
      tag: "Academic Exchange",
      desc: "An intensive 4-week cultural immersion and technical research seminar hosted in collaboration with university partners in Shinjuku, Tokyo.",
      eligibility: "Enrolled university students or recent graduates (within 2 years). Basic English proficiency. Open to all majors.",
      benefits: ["8 ECTS Academic Credits", "Tokyo Chamber of Commerce Certificate", "Company site tours (SoftBank, Sony)", "1-on-1 alumni mentorship"],
      gradient: "from-blue-400 to-indigo-500",
      icon: Compass
    },
    {
      id: 2,
      title: "Cross-Cultural Communications (Munich)",
      category: "exchange",
      tag: "Academic Exchange",
      desc: "Explores multinational operations and communication behaviors within European business markets, hosted in Munich, Germany.",
      eligibility: "Senior undergraduates, graduates, or young corporate recruits. IELTS 6.5 or equivalent recommended.",
      benefits: ["6 ECTS Academic Credits", "European Business Communications Cert", "Intercultural team workshops", "Munich startup hub networks"],
      gradient: "from-sky-400 to-blue-600",
      icon: Compass
    },
    {
      id: 3,
      title: "Executive Corporate Governance",
      category: "corporate",
      tag: "Corporate Excellence",
      desc: "Geared towards managers and governance officers looking to implement compliance framework designs and sustainable ESG policies.",
      eligibility: "Minimum 3 years of executive or managerial experience. Corporate sponsorship accepted.",
      benefits: ["Meru Governance Certificate", "Framework architectures library access", "Executive roundtable session in London", "Continuous corporate audit checklist"],
      gradient: "from-purple-400 to-pink-500",
      icon: Landmark
    },
    {
      id: 4,
      title: "Resilient Leadership Architecture",
      category: "corporate",
      tag: "Corporate Excellence",
      desc: "Equips teams with strategic risk assessment models, crisis management pathways, and communication protocols during organizational pivots.",
      eligibility: "Project managers, department leads, and senior team members.",
      benefits: ["Crisis Resilience Certification", "Risk mapping software subscription", "4 live workshops with industry auditors", "Peer advisory access"],
      gradient: "from-violet-400 to-fuchsia-600",
      icon: Landmark
    },
    {
      id: 5,
      title: "Civic Youth Fellowship",
      category: "youth",
      tag: "Youth Leadership",
      desc: "A selective 6-month incubator backing community project proposals with seed metrics, leadership resources, and policy coaching.",
      eligibility: "Ages 18 to 30. Active member of a community group or local nonprofit. A project proposal brief is required.",
      benefits: ["$2,000 Project Seed Grant eligibility", "6 months of policy mentorship", "Civic Leadership Congress delegate status", "Public relations training"],
      gradient: "from-emerald-400 to-teal-500",
      icon: Users
    },
    {
      id: 6,
      title: "Social Enterprise Accelerator",
      category: "youth",
      tag: "Youth Leadership",
      desc: "Helps early-stage social founders refine business plans, build pitch decks, and raise operational capital.",
      eligibility: "Founders of registered social businesses, B-corps, or non-profits less than 2 years old.",
      benefits: ["Pitch deck feedback from impact VCs", "Venture modeling toolkit", "Meru Impact Certificate", "Alumni registry membership"],
      gradient: "from-teal-400 to-emerald-600",
      icon: Users
    }
  ];

  const [livePrograms, setLivePrograms] = useState<any[]>(defaultPrograms);

  useEffect(() => {
    fetch("/api/programs")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((p) => ({
            id: p.id,
            title: p.name || p.title,
            category: p.category || "exchange",
            tag: p.tag || "Academic Exchange",
            desc: p.description || p.desc || "",
            eligibility: p.eligibility || "",
            benefits: Array.isArray(p.benefits) ? p.benefits : [],
            featuredImagePath: p.featuredImagePath || "",
            gradient: "from-blue-400 to-indigo-500",
            icon: Compass,
          }));
          setLivePrograms(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Filtering logic
  const filteredPrograms = livePrograms.filter((prog) => {
    const matchesCategory = activeCategory === "all" || prog.category === activeCategory;
    const matchesSearch = prog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prog.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prog.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full relative bg-slate-50/20 font-sans py-16">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">
          Admissions & Catalog
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Explore Our Programs
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto mt-4 font-medium">
          Accredited modular frameworks tailored for university exchange, corporate governance, and youth civic engagement.
        </p>
      </div>

      {/* Filter and Search Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { label: "All Portfolios", value: "all" },
            { label: "Global Exchange", value: "exchange" },
            { label: "Corporate Excellence", value: "corporate" },
            { label: "Youth Leadership", value: "youth" }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleCategoryChange(tab.value)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === tab.value
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Text Search */}
        <div className="relative w-full max-w-xs flex items-center">
          <Search className="absolute left-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-10 pr-4 text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-blue-600"
          />
        </div>
      </div>

      {/* Programs Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[300px]">
        {filteredPrograms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPrograms.map((program) => {
              const isExpanded = expandedCard === program.id;
              const CardIcon = program.icon;

              return (
                <div
                  key={program.id}
                  className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                >
                  {/* Decorative Banner or Uploaded Photo */}
                  <div className={`h-36 bg-gradient-to-tr ${program.gradient} p-6 flex items-end relative overflow-hidden`}>
                    {program.featuredImagePath ? (
                      <img src={program.featuredImagePath} alt={program.title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 bg-slate-950/10" />
                    )}
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md text-white z-10">
                      {program.tag}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col space-y-4">
                    <h3 className="font-heading text-lg font-extrabold text-slate-900 leading-tight">
                      {program.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed flex-1 font-semibold">
                      {program.desc}
                    </p>

                    {/* Expandable Info Panel */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 pt-4 space-y-4 animate-fadeIn">
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Eligibility
                          </h4>
                          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                            {program.eligibility}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Benefits & Outcomes
                          </h4>
                          <ul className="space-y-1">
                            {program.benefits.map((benefit: string, i: number) => (
                              <li key={i} className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                                <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        onClick={() => setExpandedCard(isExpanded ? null : program.id)}
                        className="w-full py-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/80 text-xs font-bold text-slate-700 flex items-center justify-center gap-1 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            Collapse Info
                            <ChevronUp className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            View Eligibility & Benefits
                            <ChevronDown className="h-4 w-4" />
                          </>
                        )}
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => triggerDownload(program.title)}
                          className="py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Brochure
                        </button>
                        <a
                          href={`/contact?program=${encodeURIComponent(program.title)}`}
                          className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1 transition-all text-center"
                        >
                          Register
                        </a>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 max-w-md mx-auto">
            <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-bold text-slate-800">No programs match filters</h3>
            <p className="text-xs text-slate-500 mt-1">Try modifying your search query or switching categories.</p>
          </div>
        )}
      </section>

      {/* Brochure Downloader Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white rounded-2xl px-5 py-4 shadow-xl border border-slate-800 flex items-center gap-3 animate-slideIn">
          <div className="p-1 rounded-lg bg-blue-600 text-white">
            <Check className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold tracking-wide">{toastMessage}</span>
        </div>
      )}

    </div>
  );
}

export default function ProgramsPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-sm font-semibold text-slate-500">Loading catalog...</div>}>
      <ProgramsCatalog />
    </Suspense>
  );
}
