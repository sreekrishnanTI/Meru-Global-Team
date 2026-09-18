"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Search, Play, X, Volume2, Pause, SkipForward, ArrowRight } from "lucide-react";

export default function TestimonialsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<{ title: string; speaker: string; details: string; duration: string; grad: string } | null>(null);

  // Video mockup play state
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoProgress, setVideoProgress] = useState(35);

  const defaultVideoTestimonials = [
    {
      id: 1,
      title: "My Academic Journey in Tokyo Shinjuku Center",
      speaker: "Sofia Rodriguez",
      details: "Tokyo Exchange Alumni, Class of 2025",
      duration: "3:42",
      grad: "from-blue-400 to-indigo-500",
    },
    {
      id: 2,
      title: "Reshaping our Corporate ESG Policies",
      speaker: "David Vance",
      details: "VP of Talent at Novis Corp",
      duration: "5:15",
      grad: "from-purple-400 to-pink-500",
    },
  ];

  const defaultWrittenTestimonials = [
    {
      id: 1,
      quote: "The Civic Youth Fellowship provided the exact funding metrics and legal support networks I needed to build my nonprofit in Colombia. It changed our trajectory entirely.",
      author: "Mateo Silva",
      role: "Founder, Ecos Col",
      rating: 5,
      program: "youth",
      region: "South America",
    },
    {
      id: 2,
      quote: "Instructors in the Munich communications program were top-tier experts. Academic credits transferred to my home college without any administrative friction.",
      author: "Lara Schmidt",
      role: "Student, Munich Exchange Program",
      rating: 4,
      program: "exchange",
      region: "Europe",
    },
    {
      id: 3,
      quote: "Corporate governance programs offered by Meru are concise, highly practical, and packed with auditable frameworks. Our compliance scores improved dramatically.",
      author: "Robert Chen",
      role: "Compliance Director, Apex Logix",
      rating: 5,
      program: "corporate",
      region: "Asia-Pacific",
    },
    {
      id: 4,
      quote: "Reaching the unreached is not just a motto for Meru; they live it. Their scholarship support made it possible for 8 of our rural coordinates to study exchange.",
      author: "Amina Yusuf",
      role: "Admissions Lead, Lagos Civic Board",
      rating: 5,
      program: "youth",
      region: "Africa",
    },
  ];

  const [videoTestimonials, setVideoTestimonials] = useState(defaultVideoTestimonials);
  const [liveTestimonials, setLiveTestimonials] = useState<any[]>(defaultWrittenTestimonials);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((t) => ({
            id: t.id,
            quote: t.quote,
            author: t.name || t.author,
            role: t.role || "",
            photoPath: t.photoPath || "",
            rating: t.rating || 5,
            program: t.program || "general",
            region: t.region || "Global",
          }));
          setLiveTestimonials(mapped);
        }
      })
      .catch(() => { });

    fetch("/api/testimonials/video")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setVideoTestimonials(data.map((video: any) => ({
            ...video,
            details: video.details || `${video.role || ""}${video.organization ? ` at ${video.organization}` : ""}`.trim(),
            grad: video.grad || "from-blue-400 to-indigo-500",
          })));
        }
      })
      .catch(() => { });
  }, []);

  const handleOpenVideo = (video: typeof videoTestimonials[0]) => {
    setActiveVideo(video);
    setVideoPlaying(true);
    setVideoProgress(35);
    setVideoModalOpen(true);
  };

  // Filter written reviews
  const filteredReviews = liveTestimonials.filter((rev) => {
    const matchesSearch = rev.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = ratingFilter === "all" || rev.rating === ratingFilter;
    return matchesSearch && matchesRating;
  });

  return (
    <div className="w-full relative bg-slate-50/20 font-sans py-16">

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">
          Community Voices
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Success Stories & Testimonials
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto mt-4 font-medium">
          Read reviews and watch feedback clips from academic partners, corporate leaders, and summit delegates.
        </p>
      </div>

      {/* Video Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <h2 className="font-heading text-xl font-extrabold text-slate-900 mb-8 flex items-center gap-2">
          <Play className="h-5 w-5 text-blue-600 fill-current" />
          Featured Video Reviews
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {videoTestimonials.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col sm:flex-row items-stretch"
            >
              {/* Mock Video Thumbnail */}
              <div className={`sm:w-48 bg-gradient-to-tr ${video.grad} p-6 flex flex-col justify-between relative overflow-hidden flex-shrink-0 min-h-[160px]`}>
                <div className="absolute inset-0 bg-slate-950/10 group-hover:bg-slate-950/20 transition-colors" />
                <span className="text-[10px] font-black text-white bg-slate-900/35 backdrop-blur-md px-2 py-0.5 rounded-md w-fit z-10">
                  {video.duration}
                </span>

                {/* Play Trigger */}
                <button
                  onClick={() => handleOpenVideo(video)}
                  className="mx-auto my-auto p-4 rounded-full bg-white/95 text-blue-600 hover:scale-110 shadow-lg transition-transform z-10"
                  aria-label="Play video testimonial"
                >
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                </button>
              </div>

              {/* Details */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-heading text-base font-extrabold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-2">{video.speaker}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{video.details}</p>
                </div>
                <button
                  onClick={() => handleOpenVideo(video)}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mt-4"
                >
                  Watch Story <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Written Feed Panel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Filters Sidebar */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 p-6 h-fit space-y-6">
            <h3 className="font-heading text-sm font-extrabold uppercase tracking-wider text-slate-900">
              Filter Feed
            </h3>

            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search words..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-blue-600"
              />
            </div>

            {/* Rating Stars Filter */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ratings</h4>
              <div className="flex flex-col gap-1.5">
                {[
                  { label: "All Ratings", value: "all" },
                  { label: "5 Stars Only", value: 5 },
                  { label: "4 Stars & Up", value: 4 }
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setRatingFilter(item.value as any)}
                    className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${ratingFilter === item.value
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    <span>{item.label}</span>
                    {typeof item.value === "number" && (
                      <div className="flex text-amber-400 gap-0.5">
                        <Star className="h-3 w-3 fill-current" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Testimonial List Grid */}
          <div className="lg:col-span-9 space-y-6">
            {filteredReviews.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between shadow-xs hover:border-blue-100 transition-colors"
                  >
                    <div className="space-y-4">
                      {/* Rating */}
                      <div className="flex text-amber-400 gap-0.5">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed font-semibold italic">
                        &ldquo;{rev.quote}&rdquo;
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {rev.photoPath ? (
                          <img
                            src={rev.photoPath}
                            alt={rev.author}
                            className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-xs shrink-0"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : null}
                        <div>
                          <cite className="not-italic font-heading text-sm font-extrabold text-slate-900 block">
                            {rev.author}
                          </cite>
                          <span className="text-xs text-slate-400 font-bold block mt-0.5">
                            {rev.role}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold bg-slate-50 border border-slate-100 text-slate-400 uppercase px-2.5 py-1 rounded-md tracking-wider">
                        {rev.region}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
                <p className="text-sm font-bold text-slate-500">No written reviews match filters.</p>
                <button
                  onClick={() => { setSearchQuery(""); setRatingFilter("all"); }}
                  className="text-xs font-bold text-blue-600 hover:underline mt-2"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Video Playback Modal Overlay */}
      <AnimatePresence>
        {videoModalOpen && activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            {/* Click outer to close */}
            <div className="absolute inset-0" onClick={() => setVideoModalOpen(false)} />

            {/* Simulated Player Container */}
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative w-full max-w-3xl bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col"
            >
              {/* Top Details */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 text-white">
                <div>
                  <h4 className="text-sm font-bold truncate max-w-md">{activeVideo.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{activeVideo.speaker}</p>
                </div>
                <button
                  onClick={() => setVideoModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Video Body Graphic (Simulates player stream screen) */}
              <div className={`aspect-video w-full bg-gradient-to-tr ${activeVideo.grad} relative flex items-center justify-center`}>
                <div className="absolute inset-0 bg-slate-950/20" />

                {/* Simulated Loading/Buffering or Paused icon */}
                {!videoPlaying && (
                  <div className="p-5 rounded-full bg-white/10 backdrop-blur-md text-white animate-pulse">
                    <Play className="h-10 w-10 fill-current ml-1" />
                  </div>
                )}
              </div>

              {/* Player Controllers */}
              <div className="px-6 py-4 bg-slate-950 text-slate-400 flex flex-col gap-3">
                {/* Timeline Bar */}
                <div className="flex items-center gap-3 w-full">
                  <span className="text-[10px] font-bold font-mono">01:18</span>
                  <div className="flex-1 h-1 bg-slate-800 rounded-full relative cursor-pointer">
                    <div
                      className="absolute inset-y-0 left-0 bg-blue-600 rounded-full"
                      style={{ width: `${videoProgress}%` }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-3 w-3 bg-white rounded-full border border-blue-600 shadow-md"
                      style={{ left: `${videoProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold font-mono">{activeVideo.duration}</span>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setVideoPlaying(!videoPlaying)}
                      className="p-2 rounded-lg hover:bg-slate-800 text-white transition-colors"
                    >
                      {videoPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                    </button>
                    <button className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
                      <SkipForward className="h-5 w-5" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5">
                      <Volume2 className="h-5 w-5" />
                      <div className="w-16 h-1 bg-slate-800 rounded-full hidden sm:block">
                        <div className="h-full w-4/5 bg-slate-400 rounded-full" />
                      </div>
                    </button>
                  </div>

                  <span className="text-[10px] font-bold font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                    720p HD
                  </span>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
