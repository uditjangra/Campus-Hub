"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden flex flex-col justify-center bg-grid-pattern">
      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-royal-blue/30 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-6 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tight leading-[0.9] text-white uppercase mb-8">
            Your Campus.<br />
            <span className="text-neon-green italic">Your People.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 font-sans">
            The private ecosystem for college students to connect, collaborate, and grow without limits.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="neon-button-filled w-full sm:w-auto text-lg group">
              Join CampusHub
              <ArrowUpRight className="inline-block ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
            <button className="neon-button w-full sm:w-auto text-lg">
              Explore Community
            </button>
          </div>
        </motion.div>
      </div>

      {/* Floating Cards */}
      <div className="relative mt-20 h-[300px] md:h-[400px] w-full max-w-7xl mx-auto">
        {/* Profile Card 1 */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [-2, 1, -2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="glass-card absolute top-0 left-10 md:left-20 p-4 w-64 -rotate-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-neon-green to-royal-blue p-0.5">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-bold">AJ</div>
            </div>
            <div>
              <p className="font-bold text-sm">@alex_jordan</p>
              <p className="text-xs text-gray-400">Computer Science • 3rd Year</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10">UI Design</span>
            <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10">React</span>
          </div>
        </motion.div>

        {/* Profile Card 2 */}
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [5, 2, 5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="glass-card absolute bottom-10 right-10 md:right-20 p-4 w-64 rotate-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-royal-blue to-neon-green p-0.5">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-bold">SK</div>
            </div>
            <div>
              <p className="font-bold text-sm">@sarah_k</p>
              <p className="text-xs text-gray-400">Mechanical • 2nd Year</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-300 italic">
            &quot;Anyone needs help with Thermodynamics notes?&quot;
          </p>
        </motion.div>

        {/* Scribbles / Arrows (Mocked with decorative divs) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-50 hidden md:block">
           <svg className="w-full h-full" viewBox="0 0 800 400" fill="none" stroke="currentColor">
              <path d="M220 100 Q 400 200 580 300" stroke="#39ff14" strokeWidth="2" strokeDasharray="5 5" />
              <circle cx="220" cy="100" r="4" fill="#39ff14" />
              <circle cx="580" cy="300" r="4" fill="#39ff14" />
           </svg>
        </div>
      </div>
    </section>
  );
}
