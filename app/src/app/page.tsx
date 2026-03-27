import { Navigation } from "@/components/Navigation";
import { SignUpButton } from "@clerk/nextjs";
import { ArrowRight, BarChart3, FileDown, Lock, MessageCircle, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconBadge } from "@/components/ui/icon-badge";
import { HeroChart } from "@/components/HeroChart";
import { AnimatedHero, AnimatedTextBlock, AnimatedCTAButton } from "@/components/AnimatedHero";
import { SectionContainer } from "@/components/ui/SectionContainer";

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
        <AnimatedHero>
          <div className="grid items-center gap-y-10 lg:grid-cols-12 lg:gap-10">
            <div className="space-y-6 lg:col-span-6 lg:pr-6">
              <AnimatedTextBlock delay={0.1}>
                <p className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  Professional wealth tracking
                </p>
              </AnimatedTextBlock>
              <AnimatedTextBlock delay={0.2}>
                <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                  Build your 1Cr journey with clarity, consistency, and confidence
                </h1>
              </AnimatedTextBlock>
              <AnimatedTextBlock delay={0.3}>
                <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Stay on top of assets and liabilities with a clean, focused workspace designed for long-term wealth building. Track trends, reduce blind spots, and generate polished certificate outputs in minutes.
                </p>
              </AnimatedTextBlock>
              <AnimatedTextBlock delay={0.4}>
                <div className="flex flex-wrap items-center gap-3">
                  <SignUpButton mode="modal">
                    <AnimatedCTAButton>
                      <Button size="lg" className="min-h-12 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-6 shadow-lg shadow-purple-500/25 hover:from-purple-600 hover:to-indigo-600 hover:shadow-xl hover:shadow-purple-500/30">
                        Start Building Wealth
                        <ArrowRight aria-hidden className="h-4 w-4" />
                      </Button>
                    </AnimatedCTAButton>
                  </SignUpButton>
                  <Link href="/pricing" className="inline-flex">
                    <Button size="lg" variant="outline" className="min-h-12 rounded-xl px-6">
                      View pricing
                    </Button>
                  </Link>
                </div>
              </AnimatedTextBlock>
              <AnimatedTextBlock delay={0.5}>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {["bg-purple-400", "bg-indigo-400", "bg-emerald-400", "bg-amber-400", "bg-rose-400"].map((bg, i) => (
                      <div
                        key={i}
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${bg} text-xs font-bold text-white ring-2 ring-white dark:ring-gray-950`}
                      >
                        {["J", "A", "R", "S", "P"][i]}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Trusted by 10,000+ users</span>
                    {" "}building their wealth journey
                  </p>
                </div>
              </AnimatedTextBlock>
            </div>

            <div className="lg:col-span-6">
              <HeroChart />
            </div>
          </div>
        </AnimatedHero>

        <section className="py-14 sm:py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionContainer>
              <div className="mb-10 text-center sm:mb-12">
                <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                  Everything you need for disciplined progress
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
                  A unified workspace for tracking, insights, planning, and polished reporting.
                </p>
              </div>
            </SectionContainer>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featureCards.map((feature, index) => (
                <SectionContainer key={feature.title} delay={0.1 * (index + 1)}>
                  <Card className="h-full rounded-2xl shadow-lg transition-shadow hover:shadow-xl">
                    <CardContent className="space-y-4 pb-5">
                      <IconBadge icon={feature.icon} tone={feature.tone} label={`${feature.title} icon`} />
                      <h3 className="text-xl font-semibold tracking-tight">{feature.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </SectionContainer>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border/70 py-14 sm:py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionContainer>
              <Card className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl text-center shadow-lg">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(130deg,rgba(139,92,246,0.1),transparent_55%)]" />
                <CardContent className="space-y-4 py-7">
                  <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                    Ready to build a consistent tracking habit?
                  </h2>
                  <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                    Set your cadence, review your numbers, and keep each financial goal visible with confidence.
                  </p>
                  <div className="pt-1">
                    <SignUpButton mode="modal">
                      <AnimatedCTAButton>
                        <Button size="lg" className="min-h-12 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-6 shadow-lg shadow-purple-500/25 hover:from-purple-600 hover:to-indigo-600">
                          Create your account
                        </Button>
                      </AnimatedCTAButton>
                    </SignUpButton>
                  </div>
                </CardContent>
              </Card>
            </SectionContainer>
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
