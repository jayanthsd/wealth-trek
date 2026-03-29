"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

const sparklineData = [
  { value: 400 },
  { value: 700 },
  { value: 500 },
  { value: 900 },
  { value: 600 },
  { value: 1000 },
  { value: 800 },
];

export function DashboardMockup() {
  return (
    <div className="flex h-[450px] w-full p-6 sm:p-10 lg:p-12 overflow-hidden select-none bg-[#141414] border border-white/10 rounded-[3rem]">
      {/* Sidebar Mockup */}
      <div className="hidden w-64 shrink-0 flex-col gap-8 border-r border-white/10 pr-8 sm:flex">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-14 rounded-full bg-[#c6a558] shadow-[0_0_10px_rgba(198,165,88,0.4)]" />
          <div className="h-2 w-24 rounded-full bg-white/30" />
        </div>
        
        <div className="space-y-6 pt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between group cursor-default">
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg bg-[#222] border border-white/10 group-hover:border-[#c6a558] transition-colors" />
                <div className="h-2.5 w-24 rounded-full bg-white/20 group-hover:bg-white/40 transition-colors" />
              </div>
              <div className="h-1.5 w-8 rounded-full bg-white/10" />
            </div>
          ))}
        </div>

        <div className="mt-auto h-24 w-full rounded-2xl bg-[#1a1a1a] p-4 flex flex-col justify-between border border-[#c6a558]/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border-2 border-[#c6a558]/50 overflow-hidden shadow-lg bg-[#333]">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" className="h-full w-full object-cover" alt="User" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-28 rounded bg-white/50" />
              <div className="h-2 w-16 rounded bg-white/30" />
            </div>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "70%" }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="h-full bg-[#c6a558] shadow-[0_0_8px_#c6a558]" 
            />
          </div>
        </div>
      </div>
      
      {/* Main Content Mockup */}
      <div className="flex-1 space-y-10 pl-0 sm:pl-10 lg:pl-12">
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            <div className="h-4 w-56 rounded-full bg-white/30" />
            <div className="h-14 w-96 rounded-2xl bg-[#c6a558]/10 border-2 border-[#c6a558]/30 flex items-center px-6 shadow-xl">
              <span className="text-2xl font-display italic text-[#c6a558]" style={{ color: '#c6a558' }}>Portfolio Value</span>
            </div>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-[#1a1a1a] border border-[#c6a558]/30 flex items-center justify-center">
            <div className="h-7 w-7 rounded-lg bg-[#c6a558]/20" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-[3.5rem] bg-[#1a1a1a] border-2 border-white/10 p-7 space-y-5 shadow-lg group hover:border-[#c6a558]/50 transition-all">
              <div className="h-4 w-24 rounded-full bg-white/40" />
              <div className="h-12 w-44 rounded-xl bg-white/10 border border-white/10 shadow-inner group-hover:border-[#c6a558]/30 transition-colors" />
              <div className="h-8 w-full bg-white/5 rounded-lg flex items-center justify-between px-2">
                 <div className="h-1.5 w-12 bg-white/20 rounded-full" />
                 <div className="h-1.5 w-8 bg-[#c6a558]/40 rounded-full" />
              </div>
            </div>
          ))}
        </div>
        
        <div className="relative h-64 rounded-[4rem] bg-[#1a1a1a] border-2 border-white/15 p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#c6a558]/20 to-transparent pointer-events-none" />
          <div className="flex items-end gap-4 h-full">
            {[35, 55, 40, 75, 50, 85, 70, 95, 65, 100].map((h, i) => (
              <motion.div 
                key={i} 
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                className="flex-1 rounded-t-xl bg-[#c6a558] shadow-[0_0_15px_rgba(198,165,88,0.3)] hover:brightness-125 transition-all cursor-pointer relative group" 
                style={{ height: `${h}%` }}
              >
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-[#222] border-2 border-[#c6a558] px-4 py-2 rounded-2xl text-xs font-bold text-[#c6a558] opacity-0 group-hover:opacity-100 transition-all shadow-2xl">
                   <span style={{ color: '#c6a558' }}>+{h}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
