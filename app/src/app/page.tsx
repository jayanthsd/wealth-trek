import { Navigation } from "@/components/Navigation";
import { SignUpButton } from "@clerk/nextjs";
import { FileDown, Shield, Zap, Lock, TrendingUp, MessageCircle, Target, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main>
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                Wealth building is a marathon. Track every mile.
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Build disciplined, long-term habits by reviewing your assets and liabilities on a steady cadence. Spot trends early, course-correct, and stay on pace toward your goals—then export professional certificates in minutes when you need proof.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <SignUpButton mode="modal">
                  <button className="rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-primary/90 transition-all hover:shadow-xl">
                    Start tracking your net worth
                  </button>
                </SignUpButton>
                <Link 
                  href="/pricing"
                  className="rounded-lg border border-input bg-background px-6 py-3 text-base font-semibold text-foreground hover:bg-accent transition-colors"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  Long-term discipline
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  See how assets and liabilities move over the years.
                </h2>
                <p className="text-lg text-muted-foreground">
                  Turn steady tracking into momentum. Review your balance sheet on a set cadence, notice the gaps, and keep closing the distance between assets and liabilities one month at a time.
                </p>
                <p className="text-base text-muted-foreground">
                  Your progress is a marathon, not a sprint—consistent tracking keeps you honest, prepared, and in control of every milestone.
                </p>
              </div>

              <figure className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Illustrative trend</p>
                    <p className="text-lg font-semibold text-foreground">Assets vs. Liabilities</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                      Assets
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
                      Liabilities
                    </div>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-xl bg-gradient-to-b from-muted/40 to-background p-4">
                  <svg
                    role="img"
                    aria-labelledby="trend-title trend-desc"
                    viewBox="0 0 400 240"
                    className="h-56 w-full"
                  >
                    <title id="trend-title">Assets and liabilities trend over four years</title>
                    <desc id="trend-desc">Illustrative lines showing assets rising steadily while liabilities decrease gradually across four yearly points.</desc>
                    <g stroke="#E5E7EB" strokeWidth="1">
                      <line x1="50" y1="200" x2="380" y2="200" />
                      <line x1="50" y1="60" x2="50" y2="200" />
                    </g>
                    <g fill="#9CA3AF" fontSize="12">
                      <text x="40" y="205">0</text>
                      <text x="30" y="150">50</text>
                      <text x="26" y="100">100</text>
                      <text x="26" y="70">120</text>
                      <text x="70" y="220">Year 1</text>
                      <text x="150" y="220">Year 2</text>
                      <text x="230" y="220">Year 3</text>
                      <text x="310" y="220">Year 4</text>
                    </g>
                    <g fill="none" strokeLinecap="round" strokeWidth="3">
                      <path
                        d="M70 170 C 110 140, 150 120, 190 105 S 270 70, 310 60"
                        stroke="#10B981"
                      />
                      <path
                        d="M70 140 C 120 150, 160 155, 200 150 S 280 140, 310 135"
                        stroke="#F59E0B"
                      />
                    </g>
                  </svg>
                </div>
                <figcaption className="mt-4 text-sm text-muted-foreground">
                  Illustrative example: Assets trending up while liabilities shrink over multiple years. Values shown are sample only—use your own tracking to see your real progress.
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Everything you need to build wealth
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                A complete suite to track, analyze, and grow your net worth over time
              </p>
            </div>

            <div className="mx-auto max-w-5xl">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <div className="relative rounded-2xl border bg-card p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-foreground">
                    Wealth Tracking
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Visualize how your assets, liabilities, and net worth evolve over time with trend charts.
                  </p>
                </div>

                <div className="relative rounded-2xl border bg-card p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-foreground">
                    Smart Analytics
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Get actionable insights on your financial movements — spot new liabilities, track asset growth, and receive suggestions.
                  </p>
                </div>

                <div className="relative rounded-2xl border bg-card p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-foreground">
                    AI Financial Advisor
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Chat with an AI advisor who understands your finances and helps you build actionable goals.
                  </p>
                </div>

                <div className="relative rounded-2xl border bg-card p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <Target className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-foreground">
                    Goal Setting
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Set and track financial goals. Your advisor helps you define targets and timelines.
                  </p>
                </div>

                <div className="relative rounded-2xl border bg-card p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileDown className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-foreground">
                    PDF Certificates
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Generate professional net worth certificates in PDF format, ready for official use.
                  </p>
                </div>

                <div className="relative rounded-2xl border bg-card p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Lock className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-foreground">
                    Privacy First
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    All your financial data stays securely in your browser. No server uploads, complete privacy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t bg-gradient-to-b from-background to-primary/5 py-20 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Ready to build a consistent tracking habit?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Set your cadence, review your numbers, and keep every wealth goal on track with clear, professional outputs.
              </p>
              <div className="mt-10">
                <SignUpButton mode="modal">
                  <button className="rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-primary/90 transition-all hover:shadow-xl">
                    Start Tracking Your Wealth
                  </button>
                </SignUpButton>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4 sm:px-6">
          <p className="text-center text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Wealth Tracker</span>
            {" "}&mdash;{" "}
            <span className="inline-flex items-center gap-1">
              🔒 All data stays securely in your browser
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
