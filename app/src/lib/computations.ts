import { StatementEntry } from "@/types";

export function computeEffectiveValue(entry: StatementEntry): number {
  return (entry.closingBalance * entry.ownershipPercentage) / 100;
}

export function computeTotals(entries: StatementEntry[]) {
  let totalAssets = 0;
  let totalLiabilities = 0;

  for (const entry of entries) {
    const effective = computeEffectiveValue(entry);
    if (entry.category === "asset") {
      totalAssets += effective;
    } else {
      totalLiabilities += effective;
    }
  }

  return {
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
  };
}

export function formatINR(value: number): string {
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const [intPart, decPart] = absValue.toFixed(2).split(".");

  let formatted = "";
  const digits = intPart.split("");
  const len = digits.length;

  if (len <= 3) {
    formatted = intPart;
  } else {
    formatted = digits.slice(len - 3).join("");
    let remaining = digits.slice(0, len - 3);
    while (remaining.length > 2) {
      formatted = remaining.slice(remaining.length - 2).join("") + "," + formatted;
      remaining = remaining.slice(0, remaining.length - 2);
    }
    formatted = remaining.join("") + "," + formatted;
  }

  return (isNegative ? "-" : "") + "\u20B9" + formatted + "." + decPart;
}
