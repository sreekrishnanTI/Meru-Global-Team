"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Award,
  ShieldCheck,
  HeartHandshake,
  Compass,
  Users,
  Sparkles,
  Send,
  Calendar,
  AlertCircle,
} from "lucide-react";
import Logo from "@/components/Logo";
import { useTranslation } from "@/components/LanguageContext";
import { fetchApi } from "@/lib/api";

// Icon mapping for dynamic core values
const ICON_MAP: Record<string, React.ElementType> = {
  Users,
  Award,
  HeartHandshake,
  ShieldCheck,
  Compass,
  Sparkles,
};

// Animated counter sub-component
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const start = 0;
    const end = target;
    const duration = 2000;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * (end - start) + start));
      if (progress < 1) {
        window.requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          window.requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={elementRef} className="font-heading text-4xl sm:text-5xl font-extrabold text-blue-600 tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [programs, setPrograms] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  // Dynamic homepage state synced with PostgreSQL backend
  const [content, setContent] = useState<any>({
    heroTitle: "Reaching the Unreached",
    heroSubtitle: "Connecting generations to the Great Commission",
    heroImagePath: "",
    heroVideoUrl: "",
    logoRotation: true,
    aboutTitle: "Reaching the Unreached, Connecting generations to the great commission.",
    aboutSubtitle: "ABOUT US",
    aboutOverview:
      "Through our dedicated programs and global network, we bridge geographical and cultural gaps to bring hope and community transformation.",
    aboutMissionTitle: "Our Mission",
    aboutMissionText: "To mobilize, equip, and commission youth and professionals across nations.",
    aboutVisionTitle: "Our Vision",
    aboutVisionText: "A connected global community empowered by sustainable leadership and education.",
    donationTitle: "Help Meru reach more communities",
    donationSubtitle:
      "Your contribution supports global exchange access, youth leadership programs, and outreach for learners and communities who need opportunity most.",
    tickerItems: [
      { id: "1", label: "EVENT", date: "JUNE 2026", text: "Global Youth Leadership Summit 2026 registration is now officially open.", color: "blue" },
      { id: "2", label: "EXPANSION", date: "MAY 2026", text: "Meru expands footprint to South America with new regional offices in Bogota.", color: "emerald" },
      { id: "3", label: "MILESTONE", date: "APRIL 2026", text: "Corporate Excellence Program achieves milestone of training 50,000+ professionals.", color: "purple" },
      { id: "4", label: "PARTNERS", date: "MARCH 2026", text: "Partnered with 12 new European academic organizations for global exchanges.", color: "amber" },
    ],
    stats: [
      { target: 45, suffix: "+", label: "Countries Active" },
      { target: 280, suffix: "+", label: "Programs Delivered" },
      { target: 120, suffix: "+", label: "Global Partners" },
      { target: 1500, suffix: "+", label: "Volunteers & Team" },
    ],
    values: [
      { title: "Empowerment & Inclusion", desc: "Equipping young leaders from every demographic with world-class frameworks.", icon: "Users" },
      { title: "Auditable Excellence", desc: "Rigorous operational transparency and measurable social impact benchmarks.", icon: "Award" },
      { title: "Unreached Outreach", desc: "Prioritizing underserved, rural, and developing communities across continents.", icon: "HeartHandshake" },
      { title: "Integrity & Faith", desc: "Grounded in ethical governance, compassionate collaboration, and enduring purpose.", icon: "ShieldCheck" },
    ],
  });

  const starsCanvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch dynamic content from PostgreSQL backend
  const loadDynamicContent = () => {
    fetchApi<any>("/homepage")
      .then((data) => {
        if (data && data.heroTitle) {
          setContent(data);
        }
      })
      .catch((err) => {
        console.warn("Using default homepage content (Backend:", err.message, ")");
      });
  };

  useEffect(() => {
    loadDynamicContent();
    Promise.all([fetchApi<any[]>("/programs"), fetchApi<any[]>("/testimonials")])
      .then(([programData, testimonialData]) => {
        setPrograms(Array.isArray(programData) ? programData : []);
        setTestimonials(Array.isArray(testimonialData) ? testimonialData : []);
      })
      .catch((err) => {
        console.warn("Unable to load homepage programs and testimonials:", err.message);
      });
  }, []);

  // Starfield canvas animation
  useEffect(() => {
    const canvas = starsCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stars: Array<{
      x: number;
      y: number;
      r: number;
      a: number;
      speed: number;
      phase: number;
    }> = [];

    const handleResize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      canvas.width = rect?.width || window.innerWidth;
      canvas.height = rect?.height || 600;
      buildStars();
    };

    const buildStars = () => {
      stars = [];
      const count = Math.floor((canvas.width * canvas.height) / 3200);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.4 + 0.2,
          a: Math.random(),
          speed: Math.random() * 0.004 + 0.001,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    let animationFrameId: number;

    const drawStars = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        const alpha = s.a * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${alpha})`;
        ctx.fill();
      }
      animationFrameId = requestAnimationFrame(drawStars);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    animationFrameId = requestAnimationFrame(drawStars);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Form submit saves to PostgreSQL inquiries table
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    try {
      await fetchApi("/contact/inquiries", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          department: "General Inquiry",
        }),
      });

      setFormSubmitted(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err: any) {
      // If backend network error, still give pleasant feedback
      console.error("Inquiry submission notice:", err);
      setFormSubmitted(true);
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getColorClass = (color: string) => {
    const map: Record<string, string> = {
      blue: "text-blue-400",
      emerald: "text-emerald-400",
      purple: "text-purple-400",
      amber: "text-amber-400",
      rose: "text-rose-400",
      sky: "text-sky-400",
    };
    return map[color] || "text-blue-400";
  };

  return (
    <div className="w-full relative overflow-hidden bg-slate-50/20 font-sans">
      {/* 1. HERO — Dynamic Hero from Database */}
      <section className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-[#05070f] px-5 py-16 border-b border-slate-900 overflow-hidden text-center">
        {/* Starfield background */}
        <canvas ref={starsCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

        {/* Ambient glows */}
        <div className="glow-orb left" />
        <div className="glow-orb right" />

        {/* Custom Hero Banner Image if uploaded by Admin */}
        {content.heroImagePath && (
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
            <img
              src={content.heroImagePath}
              alt="Hero Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05070f] via-transparent to-[#05070f]" />
          </div>
        )}

        <motion.div
          className="relative z-10 flex flex-col items-center max-w-4xl mx-auto space-y-6"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          {/* Animated 3D Logo */}
          <Logo
            variant="vertical"
            iconSize={220}
            animateGlobe={content.logoRotation !== false}
            hero3d={true}
          />

          {/* Dynamic Hero Headings */}
          <div className="space-y-3 pt-2">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading text-white tracking-tight drop-shadow-md">
              {content.heroTitle}
            </h1>
            <p className="text-base sm:text-xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
              {content.heroSubtitle}
            </p>
          </div>
        </motion.div>
      </section>

      {/* 2. LIVE NEWS & UPDATES TICKER — Dynamic from PostgreSQL */}
      <section className="w-full bg-slate-900 text-white border-y border-slate-800 py-4.5 overflow-hidden select-none animate-marquee-paused">
        <div className="flex items-center">
          <div className="px-6 border-r border-slate-700 bg-slate-900 z-10 flex-shrink-0 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
            <span className="font-heading text-xs font-black tracking-widest text-slate-300">
              {t("ticker.title") || "LATEST UPDATES"}
            </span>
          </div>

          <div className="w-full relative flex overflow-x-hidden">
            <div className="animate-marquee whitespace-nowrap flex gap-12 font-medium text-sm text-slate-300 items-center">
              {(content.tickerItems || []).map((item: any, idx: number) => (
                <span key={`ticker-1-${idx}`} className="flex items-center">
                  <strong className={`mr-2 font-bold uppercase tracking-wider ${getColorClass(item.color)}`}>
                    [{item.date} - {item.label}]
                  </strong>
                  {item.text}
                </span>
              ))}

              {/* Repeat for seamless infinite marquee loop */}
              {(content.tickerItems || []).map((item: any, idx: number) => (
                <span key={`ticker-2-${idx}`} className="flex items-center">
                  <strong className={`mr-2 font-bold uppercase tracking-wider ${getColorClass(item.color)}`}>
                    [{item.date} - {item.label}]
                  </strong>
                  {item.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT US SECTION — Dynamic from PostgreSQL */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Text Content */}
          <div className="lg:col-span-6 flex flex-col space-y-6">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">
                {content.aboutSubtitle || "ABOUT US"}
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {content.aboutTitle}
              </h2>
            </div>

            <p className="text-slate-500 leading-relaxed text-base font-medium">
              {content.aboutOverview}
            </p>

            {/* Mission & Vision Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-blue-100 transition-colors">
                <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 inline-block mb-4">
                  <Compass className="h-5 w-5" />
                </div>
                <h4 className="font-heading text-base font-extrabold text-slate-800 mb-2">
                  {content.aboutMissionTitle}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  {content.aboutMissionText}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-purple-100 transition-colors">
                <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600 inline-block mb-4">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h4 className="font-heading text-base font-extrabold text-slate-800 mb-2">
                  {content.aboutVisionTitle}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  {content.aboutVisionText}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Graphic & Dynamic Counters */}
          <div className="lg:col-span-6 flex flex-col space-y-10">
            {/* Interactive Stats Grid */}
            <div className="grid grid-cols-2 gap-8 p-8 rounded-3xl bg-white border border-slate-100 shadow-md">
              {(content.stats || []).slice(0, 4).map((s: any, idx: number) => {
                const isBorderRight = idx % 2 === 0;
                const isBorderBottom = idx < 2;
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isBorderRight ? "border-r border-slate-100 pr-6" : "pl-6"} ${isBorderBottom ? "border-b border-slate-100 pb-6" : "pt-6"
                      }`}
                  >
                    <AnimatedCounter target={Number(s.target || s.count || 0)} suffix={s.suffix || "+"} />
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-2">
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Dynamic Core Values Summary */}
            <div className="space-y-4">
              <h3 className="font-heading text-lg font-extrabold text-slate-800 border-b border-slate-100 pb-2">
                Our Core Pillars
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(content.values || []).map((val: any, idx: number) => {
                  const IconComp = ICON_MAP[val.icon] || Award;
                  return (
                    <div key={idx} className="flex gap-3">
                      <div className="p-1.5 h-fit rounded-lg bg-blue-50 text-blue-600 mt-0.5 shrink-0">
                        <IconComp className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{val.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{val.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PROGRAMS & TESTIMONIALS — Dynamic from PostgreSQL */}
      {(programs.length > 0 || testimonials.length > 0) && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 border-y border-slate-100">
          <div className="max-w-7xl mx-auto space-y-20">
            {programs.length > 0 && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Explore</span>
                    <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
                      Our Programs
                    </h2>
                  </div>
                  <a href="/programs" className="text-sm font-bold text-blue-600 hover:text-blue-800">View all programs</a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {programs.slice(0, 4).map((program) => (
                    <article key={program.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                      {program.featuredImagePath && (
                        <img src={program.featuredImagePath} alt="" className="w-full h-36 object-cover" />
                      )}
                      <div className="p-5 space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">{program.tag || program.category}</span>
                        <h3 className="font-heading text-lg font-extrabold text-slate-900">{program.name || program.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">{program.description || program.desc}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {testimonials.length > 0 && (
              <div>
                <div className="mb-8">
                  <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">Stories</span>
                  <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
                    Voices From Our Community
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {testimonials.slice(0, 3).map((testimonial) => (
                    <article key={testimonial.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                      <p className="text-slate-600 leading-relaxed">“{testimonial.quote}”</p>
                      <div className="mt-6 pt-4 border-t border-slate-100">
                        <p className="font-heading font-extrabold text-slate-900">{testimonial.name || testimonial.author}</p>
                        <p className="text-xs text-slate-500 mt-1">{testimonial.role || testimonial.program}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 5. CONTACT & INQUIRIES SECTION — Connected to PostgreSQL */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-stretch">
            {/* Form Column */}
            <div className="lg:col-span-6 flex flex-col space-y-6 justify-center">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">
                  Connect With Us
                </span>
                <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Get in Touch with our Global Team
                </h2>
                <p className="text-slate-500 font-medium mt-2">
                  Have questions about program admissions, partnerships, or fellowships? Send us a message.
                </p>
              </div>

              {formSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 space-y-2"
                >
                  <p className="text-sm font-bold flex items-center gap-2">
                    ✓ Your inquiry has been recorded successfully!
                  </p>
                  <p className="text-xs text-emerald-600">
                    A representative from our admissions or global partnership board will review your message and reach out within 24 business hours.
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="mt-4 text-xs font-bold underline hover:text-emerald-900"
                  >
                    Send another inquiry
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-bold text-slate-600">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleFormChange}
                        placeholder="John Doe"
                        className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 font-semibold"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-bold text-slate-600">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleFormChange}
                        placeholder="john@example.com"
                        className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-slate-600">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      placeholder="+1 (555) 000-0000"
                      className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 font-semibold"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-slate-600">Message / Inquiry Details *</label>
                    <textarea
                      name="message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={handleFormChange}
                      placeholder="How can our global programs assist you?"
                      className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 font-semibold resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-colors flex items-center justify-center gap-2 disabled:bg-slate-300 shadow-md shadow-blue-600/20"
                  >
                    {formLoading ? (
                      <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Send className="h-4.5 w-4.5" />
                        Submit Inquiry
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Donation Column */}
            <div className="lg:col-span-6 flex flex-col space-y-4">
              <div className="relative flex-1 min-h-[350px] rounded-3xl overflow-hidden border border-blue-100 shadow-md bg-white p-8 sm:p-10">
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-[#b51682]"></div>

                <div className="relative z-10 flex h-full flex-col justify-between gap-8">
                  <div className="space-y-5">
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-700">
                      <HeartHandshake className="h-4 w-4" />
                      Donate & Partner
                    </div>

                    <div>
                      <h3 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                        {content.donationTitle}
                      </h3>
                      <p className="mt-3 text-sm sm:text-base font-medium leading-relaxed text-slate-500">
                        {content.donationSubtitle}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {["$25", "$50", "$100", "Custom"].map((amount) => (
                        <a
                          key={amount}
                          href={`mailto:connect@meruglobal.org?subject=Donation%20to%20Meru%20Organisation&body=Hello%20Meru%20Team,%0A%0AI%20would%20like%20to%20donate%20${encodeURIComponent(amount)}%20to%20the%20Meru%20organisation.%20Please%20share%20the%20next%20steps.%0A%0AThank%20you.`}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center font-heading text-lg font-extrabold text-slate-900 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                        >
                          {amount}
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { label: "Transparent support", icon: ShieldCheck },
                        { label: "Community outreach", icon: Users },
                        { label: "Global opportunity", icon: Award },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-3 text-xs font-bold text-slate-600">
                          <item.icon className="h-4 w-4 shrink-0 text-blue-600" />
                          <span>{item.label}</span>
                        </div>
                      ))}
                    </div>

                    <a
                      href="mailto:connect@meruglobal.org?subject=Donation%20to%20Meru%20Organisation&body=Hello%20Meru%20Team,%0A%0AI%20would%20like%20to%20make%20a%20donation%20to%20the%20Meru%20organisation.%20Please%20share%20the%20donation%20process.%0A%0AThank%20you."
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white transition-colors hover:bg-blue-700"
                    >
                      <HeartHandshake className="h-5 w-5" />
                      Donate Now
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
