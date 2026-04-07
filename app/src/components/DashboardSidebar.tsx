"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  ClipboardEdit,
  BarChart3,
  MessageCircle,
  Target,
  LayoutDashboard,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WealthTrekLogo } from "./WealthTrekLogo";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Wealth Tracker", href: "/dashboard/wealth-tracker", icon: TrendingUp },
  { label: "Snapshot", href: "/dashboard/snapshot", icon: ClipboardEdit },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Chat", href: "/dashboard/chat", icon: MessageCircle },
  { label: "Goals", href: "/dashboard/goals", icon: Target },
];


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
            <WealthTrekLogo size={60} className="text-primary" />
            <span className="text-2xl font-bold tracking-tight text-foreground">Wealth Trek</span>
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
                    : "text-foreground/70 hover:text-foreground hover:bg-white/5"
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
        <div className="border-t border-white/5 px-6 py-5">
          <div className="flex items-center gap-2">
            <WealthTrekLogo size={24} className="text-foreground/40" />
            <span className="text-base font-semibold text-foreground/50">Wealth Trek</span>
          </div>
          <p className="mt-2 text-xs text-foreground/25">
            &copy; 2026 Wealth Trek. All rights reserved.
          </p>
        </div>
      </aside>
    </>
  );
}
