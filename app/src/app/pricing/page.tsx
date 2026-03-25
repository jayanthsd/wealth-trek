import { Navigation } from "@/components/Navigation";
import { SignUpButton } from "@clerk/nextjs";
import { Check, ShieldCheck, Zap, FileDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconBadge } from "@/components/ui/icon-badge";

const pricingTiers = [
  {
    name: "Free",
    price: "₹0",
    billing: "forever",
    description: "Perfect for getting started",
    features: [
      "Generate up to 5 certificates per month",
      "Basic financial statement tracking",
      "PDF export",
      "Browser-based storage",
      "Email support",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "₹250",
    billing: "per month",
    description: "For regular users",
    features: [
      "Unlimited certificates",
      "Advanced statement management",
      "Priority PDF generation",
      "Cloud backup & sync",
      "Document upload & AI extraction",
      "Custom branding",
      "Priority email support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "₹4999",
    billing: "per month",
    description: "For organizations",
    features: [
      "Everything in Professional",
      "Multi-user accounts",
      "Team collaboration",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
      "24/7 phone support",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main>
        <section className="relative overflow-hidden py-16 sm:py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(79,70,229,0.14),transparent_40%),radial-gradient(circle_at_88%_14%,rgba(16,185,129,0.08),transparent_36%)]" />
          <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.2rem] lg:leading-[1.06]">
                Simple, transparent pricing
              </h1>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Pick the plan that matches your needs. Every tier includes professional outputs, privacy-first handling, and guided wealth tracking.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <Card
                    key={tier.name}
                    className={`relative h-full ${
                      tier.highlighted
                        ? "border-primary/60 ring-2 ring-primary/20 lg:-translate-y-1"
                        : ""
                    }`}
                  >
                    {tier.highlighted && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="inline-flex rounded-full bg-primary px-4 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-primary-foreground">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <CardHeader className="text-center">
                      <CardTitle className="heading-display text-2xl">
                        {tier.name}
                      </CardTitle>
                      <CardDescription>{tier.description}</CardDescription>
                      <div className="pt-3">
                        <span className="heading-display text-5xl tabular-nums text-foreground">
                          {tier.price}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /{tier.billing}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent>
                    <ul className="space-y-3">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
                            <Check className="h-4 w-4 text-primary" aria-hidden />
                          </div>
                          <span className="text-sm leading-relaxed text-muted-foreground">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    </CardContent>

                    <CardFooter className="mt-auto p-5">
                      <SignUpButton mode="modal">
                        <Button
                          size="lg"
                          className={`tap-target w-full ${
                            tier.highlighted
                              ? ""
                              : "bg-background text-foreground hover:bg-accent"
                          }`}
                          variant={tier.highlighted ? "default" : "outline"}
                        >
                          {tier.cta}
                        </Button>
                      </SignUpButton>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            <div className="mx-auto mt-12 max-w-4xl">
              <Card className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(79,70,229,0.08),transparent_48%)]" />
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
          </div>
        </section>

        <section className="border-t border-border/70 py-14 sm:py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
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
          </div>
        </section>
      </main>

      <footer className="border-t bg-card/80 py-8">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
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
