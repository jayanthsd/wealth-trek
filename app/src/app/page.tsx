import { Navigation } from "@/components/Navigation";
import { SignUpButton } from "@clerk/nextjs";
import { ArrowRight, BarChart3, FileDown, Lock, MessageCircle, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconBadge } from "@/components/ui/icon-badge";

const featureCards = [
  {
    title: "Wealth Tracking",
    description:
      "Track assets, liabilities, and net worth trends with structured timelines and clear monthly progression.",
    icon: TrendingUp,
    tone: "success" as const,
  },
  {
    title: "Smart Analytics",
    description:
      "Spot meaningful shifts in your financial position early with focused summaries and practical insights.",
    icon: BarChart3,
    tone: "primary" as const,
  },
  {
    title: "Advisor Support",
    description:
      "Use built-in guidance to set goals, review milestones, and maintain long-term discipline.",
    icon: MessageCircle,
    tone: "warning" as const,
  },
  {
    title: "Goal Planning",
    description:
      "Define financial targets and monitor progress with consistent check-ins and measurable outcomes.",
    icon: Target,
    tone: "primary" as const,
  },
  {
    title: "PDF Certificates",
    description:
      "Generate professional certificate outputs quickly whenever formal proof of net worth is needed.",
    icon: FileDown,
    tone: "success" as const,
  },
  {
    title: "Privacy First",
    description:
      "Keep sensitive financial data under your control with privacy-first handling and secure defaults.",
    icon: Lock,
    tone: "warning" as const,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main>
        <section className="relative overflow-hidden py-16 sm:py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(79,70,229,0.16),transparent_42%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.1),transparent_36%)]" />
          <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-y-10 lg:grid-cols-12 lg:gap-10">
              <div className="space-y-6 lg:col-span-6 lg:pr-6">
                <p className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  Professional wealth tracking
                </p>
                <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                  Build wealth with clarity, consistency, and confidence.
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Stay on top of assets and liabilities with a clean, focused workspace designed for long-term decision making. Track trends, reduce blind spots, and generate polished certificate outputs in minutes.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <SignUpButton mode="modal">
                    <Button size="lg" className="min-h-12 rounded-xl px-6">
                      Start tracking now
                      <ArrowRight aria-hidden className="h-4 w-4" />
                    </Button>
                  </SignUpButton>
                  <Link href="/pricing" className="inline-flex">
                    <Button size="lg" variant="outline" className="min-h-12 rounded-xl px-6">
                      View pricing
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground">
                  No setup complexity. Get started quickly and keep your progress visible.
                </p>
              </div>

              <Card className="relative overflow-hidden lg:col-span-6">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(79,70,229,0.08),transparent_45%)]" />
                <CardContent className="space-y-5 pb-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Illustrative trend snapshot</p>
                      <p className="mt-1 text-xl font-semibold tracking-tight">Assets vs. liabilities trajectory</p>
                    </div>
                    <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                      4-year view
                    </span>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background/90 p-4">
                    <svg
                      role="img"
                      aria-labelledby="trend-title trend-desc"
                      viewBox="0 0 400 240"
                      className="h-56 w-full"
                    >
                      <title id="trend-title">Assets and liabilities trend over four years</title>
                      <desc id="trend-desc">Illustrative lines showing assets rising while liabilities flatten over time.</desc>
                      <g stroke="currentColor" strokeOpacity="0.15" strokeWidth="1">
                        <line x1="50" y1="200" x2="380" y2="200" />
                        <line x1="50" y1="60" x2="50" y2="200" />
                      </g>
                      <g fill="currentColor" opacity="0.65" fontSize="12">
                        <text x="38" y="205">0</text>
                        <text x="30" y="150">50</text>
                        <text x="24" y="100">100</text>
                        <text x="70" y="220">Year 1</text>
                        <text x="150" y="220">Year 2</text>
                        <text x="230" y="220">Year 3</text>
                        <text x="310" y="220">Year 4</text>
                      </g>
                      <g fill="none" strokeLinecap="round" strokeWidth="4">
                        <path d="M70 170 C 115 146, 155 120, 195 104 S 275 70, 310 58" stroke="oklch(0.596 0.145 163.225)" />
                        <path d="M70 138 C 120 144, 160 147, 200 144 S 272 136, 310 128" stroke="oklch(0.592 0.249 16.439)" />
                      </g>
                    </svg>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Sample data for illustration only. Your dashboard reflects your own entries and current net-worth trends.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center sm:mb-12">
              <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Everything you need for disciplined progress
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
                A unified workspace for tracking, insights, planning, and polished reporting.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featureCards.map((feature) => (
                <Card key={feature.title} className="h-full">
                  <CardContent className="space-y-4 pb-5">
                    <IconBadge icon={feature.icon} tone={feature.tone} label={`${feature.title} icon`} />
                    <h3 className="text-xl font-semibold tracking-tight">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border/70 py-14 sm:py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <Card className="relative mx-auto max-w-3xl overflow-hidden text-center">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(130deg,rgba(79,70,229,0.08),transparent_55%)]" />
              <CardContent className="space-y-4 py-7">
                <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                  Ready to build a consistent tracking habit?
                </h2>
                <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Set your cadence, review your numbers, and keep each financial goal visible with confidence.
                </p>
                <div className="pt-1">
                  <SignUpButton mode="modal">
                    <Button size="lg" className="min-h-12 rounded-xl px-6">
                      Create your account
                    </Button>
                  </SignUpButton>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card/80 py-8">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Wealth Tracker</span>
            {" "}&mdash;{" "}
            <span className="inline-flex items-center gap-1">
              🔒 Privacy-focused by default
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
