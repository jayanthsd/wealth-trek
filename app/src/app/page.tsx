import { Navigation } from "@/components/Navigation";
import { SignUpButton } from "@clerk/nextjs";
import { FileDown, Shield, Zap, Lock, TrendingUp, FileCheck } from "lucide-react";
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
                Track your net worth on a steady cadence
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Build the habit of reviewing your net worth quarterly once so you can spot trends early, course-correct, and stay on pace with your wealth goals—then export professional certificates in minutes when you need proof.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <SignUpButton mode="modal">
                  <button className="rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-primary/90 transition-all hover:shadow-xl">
                    Get Started Free
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

        <section className="py-20 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Everything you need for net worth certification
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Professional tools to manage your financial statements and generate certificates
              </p>
            </div>

            <div className="mx-auto max-w-5xl">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <div className="relative rounded-2xl border bg-card p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileDown className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-foreground">
                    PDF Generation
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Generate professional PDF certificates with your financial data, ready for official use.
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

                <div className="relative rounded-2xl border bg-card p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-foreground">
                    Lightning Fast
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Create certificates in minutes, not hours. Simple interface, powerful results.
                  </p>
                </div>

                <div className="relative rounded-2xl border bg-card p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-foreground">
                    Track Net Worth
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    See your net worth update on every review, compare periods, and keep your targets visible so you know if you’re ahead or behind goal.
                  </p>
                </div>

                <div className="relative rounded-2xl border bg-card p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileCheck className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-foreground">
                    Multiple Statements
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Add unlimited financial statements including bank accounts, investments, and properties.
                  </p>
                </div>

                <div className="relative rounded-2xl border bg-card p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-foreground">
                    Professional Format
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Certificates formatted to professional standards, suitable for official submissions.
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
                    Create Your Certificate Now
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
            <span className="font-medium text-foreground">Net Worth Certificate Generator</span>
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
