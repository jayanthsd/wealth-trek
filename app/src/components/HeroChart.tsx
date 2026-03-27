"use client";

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ProjectionDataPoint {
  year: string;
  netWorth: number;
}

const projectionData: ProjectionDataPoint[] = [
  { year: "2024", netWorth: 1200000 },
  { year: "2025", netWorth: 1850000 },
  { year: "2026", netWorth: 2800000 },
  { year: "2027", netWorth: 4100000 },
  { year: "2028", netWorth: 5600000 },
  { year: "2029", netWorth: 7200000 },
  { year: "2030", netWorth: 10000000 },
];

function formatLakhsCr(value: number): string {
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(0)}L`;
  return `${(value / 1000).toFixed(0)}K`;
}

export function HeroChart() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="rounded-2xl border border-border/60 bg-white/80 p-4 shadow-lg backdrop-blur-md dark:bg-gray-900/70 sm:p-6"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">
            Net Worth Projection
          </p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            Your path to 1Cr
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
          7-year view
        </span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={projectionData}>
          <defs>
            <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            strokeOpacity={0.08}
            vertical={false}
          />
          <XAxis
            dataKey="year"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "currentColor", opacity: 0.5 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={formatLakhsCr}
            tick={{ fontSize: 12, fill: "currentColor", opacity: 0.5 }}
            width={48}
          />
          <Tooltip
            formatter={(value) =>
              new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(Number(value ?? 0))
            }
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              fontSize: "13px",
            }}
            labelStyle={{ fontWeight: 600 }}
          />
          <Area
            type="monotone"
            dataKey="netWorth"
            stroke="#8B5CF6"
            strokeWidth={3}
            fill="url(#heroGradient)"
            animationDuration={1500}
            animationEasing="ease-out"
            name="Net Worth"
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Illustrative projection. Your dashboard reflects your real entries and
        trends.
      </p>
    </motion.div>
  );
}
