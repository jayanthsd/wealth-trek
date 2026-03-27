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

export function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-4 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar — desktop: static, mobile: slide-over */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/60 bg-white/80 backdrop-blur-md dark:bg-gray-950/80",
          "transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between border-b border-border/60 px-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-bold text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            <LayoutDashboard className="h-5 w-5 text-purple-500" />
            Wealth Tracker
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
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
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-purple-50 dark:bg-purple-950/40"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "relative h-4.5 w-4.5 shrink-0",
                    isActive ? "text-purple-600 dark:text-purple-400" : ""
                  )}
                />
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-border/60 px-4 py-4">
          <p className="text-xs text-muted-foreground">
            Privacy-first wealth tracking
          </p>
        </div>
      </aside>
    </>
  );
}
