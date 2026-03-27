"use client";

import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { SignUpButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, FileDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconBadge } from "@/components/ui/icon-badge";
import { PricingCard } from "@/components/ui/PricingCard";
import { SectionContainer } from "@/components/ui/SectionContainer";

interface PricingTier {
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  billing: string;
  yearlyBilling: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    monthlyPrice: "₹0",
    yearlyPrice: "₹0",
    billing: "forever",
    yearlyBilling: "forever",
    description: "Start your wealth-building journey",
    features: [
      "See your net worth grow with up to 5 certificates monthly",
      "Keep every asset and liability organized in one place",
      "Download professional PDF statements instantly",
      "Your data stays private in your browser",
      "Get help when you need it via email",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Professional",
    monthlyPrice: "₹250",
    yearlyPrice: "₹2,500",
    billing: "per month",
    yearlyBilling: "per year",
    description: "For serious wealth builders",
    features: [
      "Never lose sight of any asset — unlimited certificates",
      "Master your finances with advanced statement tools",
      "Get certificates generated faster with priority queue",
      "Never worry about data loss with cloud backup & sync",
      "Let AI extract data from your documents automatically",
      "Make every certificate yours with custom branding",
      "Jump the queue with priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    monthlyPrice: "₹4,999",
    yearlyPrice: "₹49,990",
    billing: "per month",
    yearlyBilling: "per year",
    description: "Scale wealth tracking across your organization",
    features: [
      "Everything your team needs from Professional",
      "Empower your whole team with multi-user accounts",
      "Work together seamlessly with real-time collaboration",
      "Build custom workflows with full API access",
      "Connect your existing tools with custom integrations",
      "Get a dedicated partner for your success",
      "Reach us anytime with 24/7 phone support",
      "Rest easy with enterprise SLA guarantees",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main>
        <section className="relative overflow-hidden py-16 sm:py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(139,92,246,0.16),transparent_40%),radial-gradient(circle_at_88%_14%,rgba(16,185,129,0.08),transparent_36%)]" />
          <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionContainer>
              <div className="mx-auto max-w-3xl text-center">
                <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.2rem] lg:leading-[1.06]">
                  Simple, transparent pricing
                </h1>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Pick the plan that matches your needs. Every tier includes professional outputs, privacy-first handling, and guided wealth tracking.
                </p>
              </div>
            </SectionContainer>

            {/* Monthly / Yearly toggle */}
            <SectionContainer delay={0.15}>
              <div className="mt-8 flex items-center justify-center gap-3">
                <span
                  className={`text-sm font-medium transition-colors ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}
                >
                  Monthly
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isYearly}
                  onClick={() => setIsYearly((prev) => !prev)}
                  className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-border/60 bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <span
                    className={`pointer-events-none block h-5 w-5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-md transition-transform ${
                      isYearly ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span
                  className={`text-sm font-medium transition-colors ${isYearly ? "text-foreground" : "text-muted-foreground"}`}
                >
                  Yearly
                  <span className="ml-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                    Save 17%
                  </span>
                </span>
              </div>
            </SectionContainer>

            <div className="mt-12 grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
              {pricingTiers.map((tier, index) => (
                <SectionContainer key={tier.name} delay={0.1 * (index + 1)}>
                  <PricingCard
                    name={tier.name}
                    price={isYearly ? tier.yearlyPrice : tier.monthlyPrice}
                    billing={isYearly ? tier.yearlyBilling : tier.billing}
                    description={tier.description}
                    features={tier.features}
                    cta={tier.cta}
                    highlighted={tier.highlighted}
                    ctaAction={
                      <SignUpButton mode="modal">
                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Button
                            size="lg"
                            className={`w-full rounded-xl ${
                              tier.highlighted
                                ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md hover:from-purple-600 hover:to-indigo-600"
                                : ""
                            }`}
                            variant={tier.highlighted ? "default" : "outline"}
                          >
                            {tier.cta}
                          </Button>
                        </motion.div>
                      </SignUpButton>
                    }
                  />
                </SectionContainer>
              ))}
            </div>

            {/* Trust signals */}
            <SectionContainer delay={0.5}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                <p className="text-sm text-muted-foreground">No credit card required</p>
                <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />
                <p className="text-sm text-muted-foreground">Cancel anytime</p>
                <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />
                <p className="text-sm text-muted-foreground">30-day money-back guarantee</p>
              </div>
            </SectionContainer>

            <SectionContainer delay={0.6}>
              <div className="mx-auto mt-12 max-w-4xl">
                <Card className="relative overflow-hidden rounded-2xl shadow-lg">
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(139,92,246,0.08),transparent_48%)]" />
                  <CardContent className="space-y-6 py-7 text-center">
                    <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                      All plans include
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <IconBadge icon={ShieldCheck} label="Privacy First icon" className="mx-auto" tone="success" />
                        <p className="font-medium text-foreground">Privacy First</p>
                        <p className="text-sm text-muted-foreground">
                          Your data stays in your browser
                        </p>
                      </div>
                      <div className="space-y-2">
                        <IconBadge icon={Zap} label="Fast Generation icon" className="mx-auto" tone="primary" />
                        <p className="font-medium text-foreground">Fast Generation</p>
                        <p className="text-sm text-muted-foreground">
                          Certificates in minutes
                        </p>
                      </div>
                      <div className="space-y-2">
                        <IconBadge icon={FileDown} label="Professional PDFs icon" className="mx-auto" tone="warning" />
                        <p className="font-medium text-foreground">Professional PDFs</p>
                        <p className="text-sm text-muted-foreground">
                          Official format certificates
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </SectionContainer>
          </div>
        </section>

        <section className="border-t border-border/70 py-14 sm:py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionContainer>
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Frequently Asked Questions
                </h2>
                <div className="mt-8 space-y-6 text-left">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Can I switch plans later?
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Is my financial data secure?
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Absolutely. All data is stored locally in your browser by default. Premium plans offer optional encrypted cloud backup.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Do you offer refunds?
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Yes, we offer a 30-day money-back guarantee on all paid plans, no questions asked.
                    </p>
                  </div>
                </div>
              </div>
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
              🔒 All data stays securely in your browser
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
