import { Navigation } from "@/components/Navigation";
import { SignUpButton } from "@clerk/nextjs";
import { Check } from "lucide-react";

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
        <section className="py-20 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Simple, transparent pricing
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Choose the plan that's right for you. All plans include our core features.
              </p>
            </div>

            <div className="mx-auto max-w-6xl">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={`relative rounded-2xl border ${
                      tier.highlighted
                        ? "border-primary shadow-xl scale-105"
                        : "border-border shadow-sm"
                    } bg-card p-8 transition-all hover:shadow-lg`}
                  >
                    {tier.highlighted && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="inline-flex rounded-full bg-primary px-4 py-1 text-sm font-semibold text-white">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-foreground">
                        {tier.name}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {tier.description}
                      </p>
                      <div className="mt-6">
                        <span className="text-5xl font-bold text-foreground">
                          {tier.price}
                        </span>
                        <span className="text-muted-foreground">
                          /{tier.billing}
                        </span>
                      </div>
                    </div>

                    <ul className="mt-8 space-y-4">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-8">
                      <SignUpButton mode="modal">
                        <button
                          className={`w-full rounded-lg px-6 py-3 text-base font-semibold transition-all ${
                            tier.highlighted
                              ? "bg-primary text-white shadow-lg hover:bg-primary/90 hover:shadow-xl"
                              : "border border-input bg-background text-foreground hover:bg-accent"
                          }`}
                        >
                          {tier.cta}
                        </button>
                      </SignUpButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mx-auto max-w-3xl mt-16">
              <div className="rounded-2xl border bg-card p-8 text-center">
                <h3 className="text-xl font-semibold text-foreground">
                  All plans include
                </h3>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="font-medium text-foreground">🔒 Privacy First</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your data stays in your browser
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">⚡ Fast Generation</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Certificates in minutes
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">📄 Professional PDFs</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Official format certificates
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t bg-gradient-to-b from-background to-primary/5 py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold text-foreground">
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
