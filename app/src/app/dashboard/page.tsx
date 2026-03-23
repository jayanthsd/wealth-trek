import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  Calculator,
  BarChart3,
  MessageCircle,
  Target,
} from "lucide-react";

const dashboardCards = [
  {
    title: "Wealth Tracker",
    description:
      "View your assets and liabilities trend over the years. Track how your net worth evolves.",
    href: "/dashboard/wealth-tracker",
    icon: TrendingUp,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "Net Worth Calculator",
    description:
      "Calculate your current net worth, manage statements, and generate PDF certificates.",
    href: "/dashboard/calculator",
    icon: Calculator,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Analytics",
    description:
      "Get insights on your asset and liability movements with actionable suggestions.",
    href: "/dashboard/analytics",
    icon: BarChart3,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    title: "Chat",
    description:
      "Converse with your AI financial advisor to get guidance and build financial goals.",
    href: "/dashboard/chat",
    icon: MessageCircle,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    title: "Goals",
    description:
      "View and manage your financial goals. Track progress toward your targets.",
    href: "/dashboard/goals",
    icon: Target,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
];

export default function DashboardHub() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome to your Wealth Tracker
        </h1>
        <p className="mt-2 text-muted-foreground">
          Build financial discipline by tracking your net worth regularly.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {dashboardCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="group relative flex h-full flex-col p-6 hover:shadow-lg transition-all cursor-pointer border hover:border-primary/30">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg} ${card.color}`}
              >
                <card.icon className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {card.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {card.description}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
