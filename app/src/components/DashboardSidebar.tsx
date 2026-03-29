"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Calculator,
  BarChart3,
  MessageCircle,
  Target,
  LayoutDashboard,
  Menu,
  X,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Wealth Tracker", href: "/dashboard/wealth-tracker", icon: TrendingUp },
  { label: "Calculator", href: "/dashboard/calculator", icon: Calculator },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Chat", href: "/dashboard/chat", icon: MessageCircle },
  { label: "Goals", href: "/dashboard/goals", icon: Target },
];

function WaveMark() {
  return (
    <svg 
      width="20" 
      height="12" 
      viewBox="0 0 22 14" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <path 
        d="M1 7C3.5 2 6.5 2 8 7C9.5 12 12.5 12 14 7C15.5 2 18.5 2 21 7" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow lg:hidden active:scale-95 transition-transform"
        aria-label="Open navigation"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar — desktop: static, mobile: slide-over */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/5 surface-dark-glass",
          "transition-transform duration-500 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-white/5">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
            onClick={() => setMobileOpen(false)}
          >
            <WaveMark />
            <span className="font-display italic text-xl text-foreground tracking-tight">Wealth Trek</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground/40 hover:bg-white/5 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-8">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group relative flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all duration-300",
                  isActive
                    ? "text-primary"
                    : "text-foreground/50 hover:text-foreground hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-2xl bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(198,165,88,0.1)]"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "relative h-5 w-5 shrink-0 transition-colors",
                    isActive ? "text-primary" : "group-hover:text-primary/70"
                  )}
                />
                <span className="relative tracking-wide">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-dot"
                    className="absolute right-4 h-1.5 w-1.5 rounded-full bg-primary shadow-glow" 
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-white/5 px-6 py-6">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30 italic">
            <Sparkles className="h-3 w-3 text-primary/50" />
            Private Edition 2026
          </div>
        </div>
      </aside>
    </>
  );
}
