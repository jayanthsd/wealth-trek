import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/db";
import { getWealthPercentileResult } from "@/lib/wealthPercentile";

export async function GET() {
  const { userId, supabase } = await getAuthenticatedClient();
  if (!userId || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from("snapshots")
      .select("net_worth, date")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json({
        error: "NO_STATEMENTS",
        message: "Connect your accounts to see your percentile",
      });
    }

    const result = getWealthPercentileResult(data.net_worth);
    return NextResponse.json({ ...result, lastUpdated: data.date });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to compute percentile" },
      { status: 500 }
    );
  }
}
