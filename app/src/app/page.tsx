import { Navigation } from "@/components/Navigation";
import { SignUpButton } from "@clerk/nextjs";
import { ArrowRight, BarChart3, FileDown, Lock, MessageCircle, Target, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconBadge } from "@/components/ui/icon-badge";
import { HeroChart } from "@/components/HeroChart";
import { AnimatedHero, AnimatedTextBlock, AnimatedCTAButton, ProductReveal, CardReveal } from "@/components/AnimatedHero";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { FeatureCard } from "@/components/FeatureCard";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

const featureCards = [
  {
    title: "Wealth Tracking",
    description:
      "Track assets, liabilities, and net worth trends with structured timelines and clear monthly progression.",
    icon: "TrendingUp",
    tone: "primary" as const,
  },
  {
    title: "Smart Analytics",
    description:
      "Spot meaningful shifts in your financial position early with focused summaries and practical insights.",
    icon: "BarChart3",
    tone: "primary" as const,
  },
  {
    title: "Advisor Support",
    description:
      "Use built-in guidance to set goals, review milestones, and maintain long-term discipline.",
    icon: "MessageCircle",
    tone: "primary" as const,
  },
  {
    title: "Goal Planning",
    description:
      "Define financial targets and monitor progress with consistent check-ins and measurable outcomes.",
    icon: "Target",
    tone: "primary" as const,
  },
  {
    title: "PDF Certificates",
    description:
      "Generate professional certificate outputs quickly whenever formal proof of net worth is needed.",
    icon: "FileDown",
    tone: "primary" as const,
  },
  {
    title: "Privacy First",
    description:
      "Keep sensitive financial data under your control with privacy-first handling and secure defaults.",
    icon: "Lock",
    tone: "primary" as const,
  },
];


function DashboardMockup() {
  const sidebarItems = [
    { name: "Overview", icon: "grid", active: true },
    { name: "Wealth Tracker", icon: "lineChart", active: false },
    { name: "Calculator", icon: "calculator", active: false },
    { name: "Analytics", icon: "barChart", active: false },
    { name: "Chat", icon: "chat", active: false },
    { name: "Goals", icon: "target", active: false },
  ];

  const milestones = [
    { name: "1Cr Net Worth", current: "0.42Cr", target: "1.0Cr", progress: 42, color: "gold" },
    { name: "Emergency Fund", current: "4.0L", target: "6.0L", progress: 67, color: "green" },
    { name: "Home Loan Payoff", current: "14.5L", target: "20.0L", progress: 73, color: "red" },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-[600px] w-full p-6 sm:p-8 select-none bg-[#0a0a0a] rounded-[3rem] relative z-20 font-sans border border-[oklch(0.78_0.12_80)]/30 overflow-hidden">
      {/* Sidebar Mockup */}
      <div className="hidden lg:flex w-64 shrink-0 flex-col gap-6 pr-6 relative z-20">
        {/* Navigation Items */}
        <div className="space-y-2 pt-2">
          {sidebarItems.map((item, i) => (
            <div 
              key={i} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-default ${
                item.active 
                  ? 'bg-[oklch(0.78_0.12_80)]/10 border border-[oklch(0.78_0.12_80)]/20' 
                  : 'hover:bg-white/5'
              }`}
            >
              <div className={`h-5 w-5 rounded ${item.active ? 'bg-[oklch(0.78_0.12_80)]' : 'bg-[#333]'}`} />
              <span className={`text-sm font-medium ${item.active ? 'text-[oklch(0.78_0.12_80)]' : 'text-gray-400'}`}>
                {item.name}
              </span>
              {item.active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[oklch(0.78_0.12_80)]" />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Mockup */}
      <div className="flex-1 space-y-6 pl-0 lg:pl-6 pt-2 relative z-20 text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-display italic text-white">Welcome back!</h2>
            <p className="text-sm text-gray-500 mt-1">Begin your documentation to visualize your trajectory.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#333] text-xs text-gray-300 flex items-center gap-2">
              <span className="text-[oklch(0.78_0.12_80)]">+</span> ADD ASSET
            </button>
            <button className="px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#333] text-xs text-gray-300 flex items-center gap-2">
              <span className="text-[oklch(0.78_0.12_80)]">+</span> ADD LIABILITY
            </button>
            <button className="px-4 py-2 rounded-lg bg-[oklch(0.78_0.12_80)]/10 border border-[oklch(0.78_0.12_80)]/30 text-xs text-[oklch(0.78_0.12_80)] flex items-center gap-2">
              <span>📄</span> GENERATE REPORT
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Net Worth & Milestones */}
          <div className="space-y-6">
            {/* Total Net Worth Card */}
            <div className="rounded-[2rem] bg-[#111] border border-[#222] p-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-widest text-gray-500">TOTAL NET WORTH</span>
              </div>
              <div className="space-y-1">
                <span className="text-4xl font-bold text-white font-display">₹20,00,000</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-emerald-500 flex items-center gap-1">
                  ↗ +₹20,00,000
                </span>
                <span className="text-emerald-500/70">(+0.0% this month)</span>
              </div>
            </div>

            {/* Milestones Card */}
            <div className="rounded-[2rem] bg-[#111] border border-[#222] p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-widest text-gray-500">MILESTONES</span>
                <span className="px-2 py-1 rounded-full bg-[oklch(0.78_0.12_80)]/10 text-[10px] text-[oklch(0.78_0.12_80)] border border-[oklch(0.78_0.12_80)]/20">
                  SIMULATION MODE
                </span>
              </div>
              
              <div className="space-y-4">
                {milestones.map((milestone, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{milestone.name}</span>
                      <span className="text-gray-500 text-xs">{milestone.target}</span>
                    </div>
                    <div className="h-2 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          milestone.color === 'gold' ? 'bg-[oklch(0.78_0.12_80)]' :
                          milestone.color === 'green' ? 'bg-emerald-500' :
                          'bg-red-500'
                        }`} 
                        style={{ width: `${milestone.progress}%` }} 
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={
                        milestone.color === 'gold' ? 'text-[oklch(0.78_0.12_80)]' :
                        milestone.color === 'green' ? 'text-emerald-500' :
                        'text-red-400'
                      }>{milestone.current}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Growth Chart */}
          <div className="rounded-[2rem] bg-[#111] border border-[#222] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest text-gray-500">GROWTH ALLOCATION</span>
              <div className="flex items-center gap-4 text-[10px]">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span className="text-gray-400">ASSETS</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                  <span className="text-gray-400">LIABILITIES</span>
                </span>
              </div>
            </div>
            
            {/* Chart Area */}
            <div className="relative h-48 w-full">
              <svg viewBox="0 0 300 120" className="h-full w-full" preserveAspectRatio="none">
                {/* Grid lines */}
                <line x1="0" y1="30" x2="300" y2="30" stroke="#222" strokeWidth="1" />
                <line x1="0" y1="60" x2="300" y2="60" stroke="#222" strokeWidth="1" />
                <line x1="0" y1="90" x2="300" y2="90" stroke="#222" strokeWidth="1" />
                
                {/* Assets line (green, going up) */}
                <path 
                  d="M0,80 L75,70 L150,60 L225,45 L300,30" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />
                <path 
                  d="M0,80 L75,70 L150,60 L225,45 L300,30 L300,120 L0,120 Z" 
                  fill="url(#assetGradient)" 
                  opacity="0.1"
                />
                
                {/* Liabilities line (orange, going down) */}
                <path 
                  d="M0,40 L75,45 L150,55 L225,65 L300,75" 
                  fill="none" 
                  stroke="#f97316" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />
                
                {/* Data points */}
                <circle cx="0" cy="80" r="3" fill="#10b981" />
                <circle cx="150" cy="60" r="3" fill="#10b981" />
                <circle cx="300" cy="30" r="4" fill="#10b981" />
                <circle cx="0" cy="40" r="3" fill="#f97316" />
                <circle cx="150" cy="55" r="3" fill="#f97316" />
                <circle cx="300" cy="75" r="4" fill="#f97316" />
                
                <defs>
                  <linearGradient id="assetGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-600 -ml-6">
                <span>80L</span>
                <span>60L</span>
                <span>40L</span>
                <span>20L</span>
                <span>0L</span>
              </div>
            </div>
            
            {/* X-axis labels */}
            <div className="flex justify-between text-[10px] text-gray-600 px-2">
              <span>Jan</span>
              <span>Jun</span>
              <span>Jan</span>
            </div>
          </div>
        </div>

        {/* Intelligence Feed */}
        <div className="pt-4">
          <span className="text-[10px] font-bold tracking-widest text-gray-500">INTELLIGENCE FEED</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <main>
        <AnimatedHero>
          <div className="grid items-center gap-y-12 lg:grid-cols-12 lg:gap-16">
            <div className="space-y-8 lg:col-span-6">
              <AnimatedTextBlock delay={0.1}>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  <Sparkles className="h-3 w-3" />
                  Professional wealth tracking
                </div>
              </AnimatedTextBlock>

              <AnimatedTextBlock delay={0.2}>
                <h1 className="text-balance text-5xl font-medium tracking-tight sm:text-6xl lg:text-[4.2rem] lg:leading-[1]">
                  Build your <span className="text-warm-gold italic font-display">1 Crore journey</span> with clarity.
                </h1>
              </AnimatedTextBlock>

              <AnimatedTextBlock delay={0.3}>
                <p className="max-w-2xl text-lg leading-relaxed text-foreground/60 italic font-display sm:text-xl">
                  A private, high-fidelity workspace designed for precision wealth management. Track assets, visualize growth, and command your financial future.
                </p>
              </AnimatedTextBlock>

              <AnimatedTextBlock delay={0.4}>
                <div className="flex flex-wrap items-center gap-4">
                  <AnimatedCTAButton>
                    <SignUpButton mode="modal">
                      <button className="min-h-14 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                        Create Private Account
                        <ArrowRight aria-hidden className="h-4 w-4" />
                      </button>
                    </SignUpButton>
                  </AnimatedCTAButton>
                  <Link href="/pricing" className="inline-flex">
                    <AnimatedCTAButton>
                      <button className="min-h-14 rounded-full border border-white/10 bg-white/5 px-8 text-sm font-medium text-foreground transition-all hover:bg-white/10">
                        View Pricing
                      </button>
                    </AnimatedCTAButton>
                  </Link>
                </div>
              </AnimatedTextBlock>

              <AnimatedTextBlock delay={0.5}>
                <div className="flex items-center gap-4 pt-4">
                  <div className="flex -space-x-3">
                    {[
                      { initials: "AS", color: "bg-[oklch(0.78_0.12_80)]" },
                      { initials: "RK", color: "bg-[oklch(0.75_0.10_75)]" },
                      { initials: "PM", color: "bg-[oklch(0.78_0.12_80)]" },
                      { initials: "SJ", color: "bg-[oklch(0.75_0.10_75)]" },
                      { initials: "NK", color: "bg-[oklch(0.75_0.10_75)]" }
                    ].map((user, i) => (
                      <div
                        key={i}
                        className={`h-10 w-10 rounded-full border-2 border-background ${user.color} flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:z-10`}
                      >
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                          {user.initials}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-foreground/50">
                    <span className="font-semibold text-foreground uppercase tracking-widest text-xs">Trusted by 10,000+</span>
                    <br />individuals tracking milestones
                  </p>
                </div>
              </AnimatedTextBlock>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full" />
              <HeroChart />
            </div>
          </div>
        </AnimatedHero>

        <section className="py-24 sm:py-32">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionContainer>
              <div className="text-center space-y-6 mb-20">
                <h2 className="text-balance text-4xl font-medium tracking-tight sm:text-5xl font-display italic">
                  Precision <span className="text-warm-gold">Productivity</span>
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-foreground/50 italic font-display">
                  Everything you need to command your personal balance sheet.
                </p>
              </div>
            </SectionContainer>

            <ProductReveal>
              <DashboardMockup />
            </ProductReveal>

            <div className="mt-32 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featureCards.map((feature, index) => (
                <CardReveal key={index}>
                  <FeatureCard
                    title={feature.title}
                    description={feature.description}
                    icon={feature.icon}
                    delay={0.1 * index}
                  />
                </CardReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-32 border-t border-white/5">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <ProductReveal>
              <div className="relative surface-card rounded-[3rem] p-12 sm:p-20 overflow-hidden text-center border border-white/5">
                <div className="absolute top-0 right-0 h-96 w-96 bg-primary/5 blur-[100px] -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 h-64 w-64 bg-primary/3 blur-[80px] -ml-32 -mb-32" />
                <div className="relative z-10 space-y-8">
                  <h2 className="text-balance text-5xl font-medium tracking-tight sm:text-6xl font-display italic">
                    Start your <span className="text-warm-gold">private journey</span> today.
                  </h2>
                  <p className="mx-auto max-w-2xl text-xl text-foreground/50 italic font-display">
                    Secure your financial future with the tools designed for clarity and long-term success.
                  </p>
                  <div className="pt-4">
                    <AnimatedCTAButton>
                      <SignUpButton mode="modal">
                        <button className="min-h-16 rounded-full bg-primary px-12 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:scale-105 active:scale-95">
                          Create Private Account
                        </button>
                      </SignUpButton>
                    </AnimatedCTAButton>
                  </div>
                </div>
              </div>
            </ProductReveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-background py-12">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="font-display italic text-2xl text-foreground">Wealth Trek</span>
              <span className="h-1 w-1 rounded-full bg-primary/50" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Midnight Ink Edition</span>
            </div>
            <p className="text-sm text-foreground/40 italic font-display">
              &copy; 2026 Wealth Trek. All rights reserved. 🔒 Private by design.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
