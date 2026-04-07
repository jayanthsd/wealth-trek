import { Navigation } from "@/components/Navigation";
import { SignUpButton } from "@clerk/nextjs";
import { ArrowRight, BarChart3, FileDown, Lock, MessageCircle, Target, TrendingUp, PlusCircle, Lightbulb } from "lucide-react";
import Link from "next/link";
import { AnimatedTextBlock, AnimatedCTAButton, CardReveal } from "@/components/AnimatedHero";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { FeatureCard } from "@/components/FeatureCard";
import { WealthTrekLogo } from "@/components/WealthTrekLogo";

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


const howItWorksSteps = [
  {
    number: "01",
    Icon: PlusCircle,
    title: "Add your assets",
    description:
      "Log your savings, investments, real estate, and liabilities. Everything in one structured place, always current.",
  },
  {
    number: "02",
    Icon: TrendingUp,
    title: "Watch your net worth",
    description:
      "See your total net worth update with each entry. Track growth month by month with clear, visual timelines.",
  },
  {
    number: "03",
    Icon: Lightbulb,
    title: "Get insights",
    description:
      "Understand what your money is doing and what it should be doing. Observations that drive action, not just numbers.",
  },
];

function OldDashboardMockup_Unused() {
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
                <span className="text-4xl font-medium text-brand-gradient font-display">₹20,00,000</span>
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
    <div className="min-h-screen bg-background">
      <Navigation />

      <main>
        {/* ─── Hero ─── */}
        <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden py-16 sm:py-20">
          <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden>
            <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
            <div className="absolute bottom-0 right-0 h-[240px] w-[240px] rounded-full bg-accent/5 blur-[90px]" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-3xl px-4 text-center sm:px-6">
            <AnimatedTextBlock delay={0}>
              <div className="mb-6 flex justify-center">
                <WealthTrekLogo size={56} className="text-primary" />
              </div>
            </AnimatedTextBlock>

            <AnimatedTextBlock delay={0.1}>
              <p className="label-caps mb-4">
                Wealth Trek
              </p>
            </AnimatedTextBlock>

            <AnimatedTextBlock delay={0.2}>
              <h1 className="text-balance text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
                Wealth, measured{" "}
                <span className="text-brand-gradient">with intention.</span>
              </h1>
            </AnimatedTextBlock>

            <AnimatedTextBlock delay={0.3}>
              <p className="mt-5 text-xl font-medium text-foreground/80 sm:text-2xl">
                Your money has a story. Here&apos;s what it&apos;s saying.
              </p>
            </AnimatedTextBlock>

            <AnimatedTextBlock delay={0.4}>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-foreground/75">
                Wealth isn&apos;t just a number — it&apos;s a reflection of every decision
                you&apos;ve made. We help you read it clearly, track it consistently, and
                understand what it should be doing for you.
              </p>
            </AnimatedTextBlock>

            <AnimatedTextBlock delay={0.5}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <AnimatedCTAButton>
                  <SignUpButton mode="modal">
                    <button className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:scale-105 active:scale-95">
                      Start Your Journey
                      <ArrowRight aria-hidden className="h-4 w-4" />
                    </button>
                  </SignUpButton>
                </AnimatedCTAButton>
                <Link href="/pricing" className="inline-flex">
                  <AnimatedCTAButton>
                    <button className="min-h-12 rounded-full border border-border bg-background px-7 text-sm font-medium text-foreground/70 transition-all hover:border-primary/30 hover:text-foreground">
                      View Pricing
                    </button>
                  </AnimatedCTAButton>
                </Link>
              </div>
            </AnimatedTextBlock>
          </div>
        </section>

        {/* ─── How it works ─── */}
        <section className="py-16 sm:py-20 border-t border-border/40">
          <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
            <SectionContainer>
              <div className="mb-12 text-center">
                <p className="label-caps mb-3">
                  How it works
                </p>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Three steps to clarity.
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
                {howItWorksSteps.map(({ number, Icon, title, description }, idx) => (
                  <CardReveal key={number}>
                    <div className="relative flex flex-col items-center text-center">
                      {idx < howItWorksSteps.length - 1 && (
                        <div
                          className="absolute hidden sm:block top-7 left-[calc(50%+2.5rem)] right-0 h-px bg-gradient-to-r from-primary/30 to-transparent"
                          aria-hidden
                        />
                      )}
                      <div className="relative z-10 mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-background shadow-sm">
                        <Icon className="h-5 w-5 text-primary" aria-hidden />
                        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                          {number}
                        </span>
                      </div>
                      <h3 className="mb-2 text-base font-semibold text-foreground">
                        {title}
                      </h3>
                      <p className="text-sm leading-relaxed text-foreground/55">
                        {description}
                      </p>
                    </div>
                  </CardReveal>
                ))}
              </div>
            </SectionContainer>
          </div>
        </section>

        {/* ─── Feature cards ─── */}
        <section className="py-16 sm:py-20 border-t border-border/40">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionContainer>
              <div className="mb-10 text-center">
                <p className="label-caps mb-3">
                  What you get
                </p>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Everything you need to{" "}
                  <span className="text-brand-gradient">track your wealth.</span>
                </h2>
              </div>
            </SectionContainer>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featureCards.map((feature, index) => (
                <CardReveal key={index}>
                  <FeatureCard
                    title={feature.title}
                    description={feature.description}
                    icon={feature.icon}
                    delay={0.05 * index}
                  />
                </CardReveal>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 bg-background py-8">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <WealthTrekLogo size={32} className="text-foreground/40" />
              <span className="text-lg font-semibold text-foreground/50">Wealth Trek</span>
            </div>
            <p className="text-sm text-foreground/35">
              &copy; 2026 Wealth Trek. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
