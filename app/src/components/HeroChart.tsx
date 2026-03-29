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
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="surface-card rounded-3xl p-6 sm:p-8 shadow-glow border border-white/5"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-foreground/40">
            Net Worth Projection
          </p>
          <h3 className="mt-2 font-display italic text-2xl text-liquid-gold">
            The 1 Crore Journey
          </h3>
        </div>
        <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
          Strategic View
        </span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={projectionData}>
          <defs>
            <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.78 0.12 80)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="oklch(0.78 0.12 80)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="oklch(0.94 0.008 80)"
            strokeOpacity={0.05}
            vertical={false}
          />
          <XAxis
            dataKey="year"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "oklch(0.94 0.008 80)", opacity: 0.4, fontWeight: 500 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={formatLakhsCr}
            tick={{ fontSize: 11, fill: "oklch(0.94 0.008 80)", opacity: 0.4, fontWeight: 500 }}
            width={40}
          />
          <Tooltip
            cursor={{ stroke: 'oklch(0.78 0.12 80)', strokeWidth: 1, strokeDasharray: '4 4' }}
            formatter={(value) => [
              new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(Number(value ?? 0)),
              "Projected Net Worth"
            ]}
            contentStyle={{
              backgroundColor: "oklch(0.13 0.007 60)",
              borderRadius: "16px",
              border: "1px solid oklch(0.78 0.12 80 / 0.2)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              fontSize: "12px",
              color: "oklch(0.94 0.008 80)",
              padding: "12px",
            }}
            itemStyle={{ color: "oklch(0.78 0.12 80)", fontWeight: 600 }}
            labelStyle={{ color: "oklch(0.94 0.008 80 / 0.5)", marginBottom: "4px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}
          />
          <Area
            type="monotone"
            dataKey="netWorth"
            stroke="oklch(0.78 0.12 80)"
            strokeWidth={2.5}
            fill="url(#heroGradient)"
            animationDuration={2000}
            animationEasing="ease-in-out"
            name="Net Worth"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-6 flex items-center gap-2 text-[10px] text-foreground/30 uppercase tracking-[0.15em] font-medium italic">
        <span className="h-1 w-1 rounded-full bg-primary" />
        Interactive simulation based on target milestones
      </div>
    </motion.div>
  );
}
