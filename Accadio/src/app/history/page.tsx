"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Compass, Globe, Award, BookOpen, Clock, HeartHandshake } from "lucide-react";

export default function HistoryPage() {
  const [activeMilestone, setActiveMilestone] = useState<number | null>(null);

  const defaultMilestones = [
    {
      year: "2010",
      title: "UPG Confrence at ASCM",
      desc: "The Unreached People Groups (UPG) conference at the Asian Seminary of Christian Ministries (ASCM) became the seedbed for MERU. Rev. Dr. Roland Vaughan, coordinator of Church of God World Missions (COGWM) UPG Missions, served as keynote speaker, inspiring partnerships that later shaped MERU.",
      icon: Compass,
      color: "border-blue-500 text-blue-600 bg-blue-50",
      imageGrad: "from-blue-400 to-indigo-500"
    },
    {
      year: "2010",
      title: "Birth of partnerships",
      desc: "The conference fostered collaborations among leaders and missionaries who were instrumental in developing MERU’s vision and strategies..",
      icon: BookOpen,
      color: "border-purple-500 text-purple-600 bg-purple-50",
      imageGrad: "from-purple-400 to-pink-500"
    },
    {
      year: "2011",
      title: "Doctor of ministry reaserch project",
      desc: "Dr. George Pappachen, an ASCM D.Min. graduate, conducted research on Christian Missions for the Unreached (CMU) among the Agta people of Palanan, Isabela, Philippines. His focus on “gospel inculturation” documented best practices and laid the foundation for innovative UPG mission strategies.",
      icon: Globe,
      color: "border-emerald-500 text-emerald-600 bg-emerald-50",
      imageGrad: "from-emerald-400 to-teal-500"
    },
    {
      year: "2012",
      title: "Formation of MERU Global Team",
      desc: "Emerging from the mission's atmosphere of innovation and partnership, MERU Global Team was established as a new addition to organizations serving UPG missions worldwide. It stands as a testimony to the call of Christ to birthing ministries that connect people to the Great Commission..",
      icon: Award,
      color: "border-amber-500 text-amber-600 bg-amber-50",
      imageGrad: "from-amber-400 to-orange-500"
    },
    {
      year: "2020",
      title: "Global Expansion",
      desc: "Today, MERU has spread to nations across the world, launching training programs, hosting conferences, and building bridges between generations and cultures. Through these initiatives, MERU continues to gather people for the Great Commission, empowering Christians to reach the unreached with the Gospel.",
      icon: HeartHandshake,
      color: "border-rose-500 text-rose-600 bg-rose-50",
      imageGrad: "from-rose-400 to-red-500"
    }
  ];

  const defaultGalleryMoments = [
    { year: "2019", title: "First London Forum", tag: "Event", grad: "from-blue-400 to-indigo-500" },
    { year: "2021", title: "Tokyo Seminars Group", tag: "Academic", grad: "from-purple-400 to-pink-500" },
    { year: "2022", title: "Bogota Office Opening", tag: "Expansion", grad: "from-emerald-400 to-teal-500" },
    { year: "2023", title: "Corporate Review Board", tag: "Corporate", grad: "from-amber-400 to-orange-500" },
    { year: "2025", title: "Global Youth Congress", tag: "Summit", grad: "from-sky-400 to-blue-600" },
    { year: "2026", title: "Africa Initiative Launch", tag: "Field", grad: "from-rose-400 to-purple-600" }
  ];

  const [milestones, setMilestones] = useState(defaultMilestones);
  const [galleryMoments, setGalleryMoments] = useState(defaultGalleryMoments);

  useEffect(() => {
    fetch("/api/history")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data) return;
        if (Array.isArray(data.milestones) && data.milestones.length > 0) {
          setMilestones(data.milestones.map((item: any) => ({
            ...item,
            desc: item.desc || item.description || "",
            icon: ({ Compass, BookOpen, Globe, Award, HeartHandshake } as any)[item.icon] || Compass,
            imageGrad: item.imageGrad || "from-blue-400 to-indigo-500",
            color: item.color || "border-blue-500 text-blue-600 bg-blue-50",
          })));
        }
        if (Array.isArray(data.moments) && data.moments.length > 0) {
          setGalleryMoments(data.moments.map((item: any) => ({
            ...item,
            grad: item.grad || "from-blue-400 to-indigo-500",
          })));
        }
      })
      .catch(() => { });
  }, []);

  return (
    <div className="w-full relative bg-slate-50/20 font-sans py-16">

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">
          Milestones & Legacy
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Our Journey Timeline
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto mt-4 font-medium">
          MERU Global teams history timeline.
        </p>
      </div>

      {/* Vertical Interactive Timeline */}
      <section id="timeline" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative mb-24">
        {/* Central timeline line */}
        <div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-0.5 bg-slate-200 hidden md:block"></div>

        <div className="space-y-16">
          {milestones.map((milestone, idx) => {
            const IconComp = milestone.icon;
            const isEven = idx % 2 === 0;

            return (
              <div key={idx} className="relative flex flex-col md:flex-row items-center">

                {/* Timeline node circle */}
                <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-4 border-white bg-blue-600 shadow-md hidden md:flex items-center justify-center text-white z-10">
                  <Clock className="h-4 w-4" />
                </div>

                {/* Left Side (Even items get text, Odd items get layout placeholder) */}
                <div className={`w-full md:w-1/2 flex justify-end pr-0 md:pr-12 ${isEven ? "md:order-1" : "md:order-2"}`}>
                  {isEven ? (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setActiveMilestone(idx)}
                      className="w-full bg-white rounded-3xl border border-slate-100 p-8 shadow-xs hover:shadow-md transition-all cursor-pointer text-right flex flex-col items-end space-y-3"
                    >
                      <span className="text-xs font-black px-3 py-1 bg-blue-50 text-blue-700 rounded-full w-fit">
                        {milestone.year}
                      </span>
                      <h3 className="font-heading text-lg font-extrabold text-slate-900">
                        {milestone.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        {milestone.desc}
                      </p>
                    </motion.div>
                  ) : (
                    /* Styled visual card representation for alternate side */
                    <div className="w-full h-44 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-100/50 hidden md:flex items-center justify-center p-6 relative overflow-hidden group select-none">
                      <div className={`absolute inset-0 bg-gradient-to-tr ${milestone.imageGrad} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                      <IconComp className="h-10 w-10 text-slate-300 group-hover:text-blue-500 transition-colors duration-300" />
                    </div>
                  )}
                </div>

                {/* Right Side (Odd items get text, Even items get layout placeholder) */}
                <div className={`w-full md:w-1/2 flex justify-start pl-0 md:pl-12 ${isEven ? "md:order-2" : "md:order-1"}`}>
                  {!isEven ? (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setActiveMilestone(idx)}
                      className="w-full bg-white rounded-3xl border border-slate-100 p-8 shadow-xs hover:shadow-md transition-all cursor-pointer text-left flex flex-col items-start space-y-3"
                    >
                      <span className="text-xs font-black px-3 py-1 bg-purple-50 text-purple-700 rounded-full w-fit">
                        {milestone.year}
                      </span>
                      <h3 className="font-heading text-lg font-extrabold text-slate-900">
                        {milestone.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        {milestone.desc}
                      </p>
                    </motion.div>
                  ) : (
                    /* Styled visual card representation for alternate side */
                    <div className="w-full h-44 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-100/50 hidden md:flex items-center justify-center p-6 relative overflow-hidden group select-none">
                      <div className={`absolute inset-0 bg-gradient-to-tr ${milestone.imageGrad} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                      <IconComp className="h-10 w-10 text-slate-300 group-hover:text-purple-500 transition-colors duration-300" />
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* Historical Image Journal Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 pt-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">
            Archival Records
          </span>
          <h2 className="font-heading text-3xl font-extrabold text-slate-900 tracking-tight">
            Historical Photo Journal
          </h2>
          <p className="text-slate-500 font-medium mt-2">
            Captured snapshots highlighting our international expansion milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleryMoments.map((moment, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col gap-4 shadow-xs hover:shadow-md transition-all group"
            >
              {/* Grid gradient placeholder for photo */}
              <div className={`h-48 rounded-2xl bg-gradient-to-br ${moment.grad} opacity-90 overflow-hidden relative shadow-xs`}>
                <div className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-white/25 backdrop-blur-md text-xs font-bold text-white uppercase tracking-wider">
                  {moment.tag}
                </div>
                <div className="absolute inset-0 bg-slate-950/10 group-hover:bg-slate-950/20 transition-colors" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading text-base font-extrabold text-slate-900">{moment.title}</h4>
                  <span className="text-xs text-slate-400 font-bold block mt-0.5">Global Expedition Journey</span>
                </div>
                <span className="text-sm font-black text-slate-300 font-heading group-hover:text-blue-500 transition-colors">
                  {moment.year}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
