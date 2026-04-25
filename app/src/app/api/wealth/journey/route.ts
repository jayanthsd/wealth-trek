import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/db";
import { computeAllInsights } from "@/lib/insightsEngine";
import { parseBalanceSheet } from "@/lib/balanceSheet";
import {
  classifyWealthStage,
  detectStageTransition,
  computeStageProgress,
} from "@/lib/wealthStage";
import {
  evaluateChecklist,
  computeStageScore,
  computeStageHistory,
} from "@/lib/wealthChecklist";
import type {
  NetWorthSnapshot,
  AdvancedInputs,
  JourneyResult,
} from "@/types";

export async function POST(request: NextRequest) {
  const { userId, supabase } = await getAuthenticatedClient();
  if (!userId || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let advancedInputs: AdvancedInputs | undefined;
  try {
    const body = await request.json();
    advancedInputs = body?.advancedInputs;
  } catch {
    // No body or invalid JSON — proceed without advanced inputs
  }

  try {
    const { data, error } = await supabase
      .from("snapshots")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const snapshots: NetWorthSnapshot[] = (data || []).map((row: any) => ({
      id: row.id,
      date: row.date,
      totalAssets: row.total_assets,
      totalLiabilities: row.total_liabilities,
      netWorth: row.net_worth,
      entries:
        typeof row.entries_json === "string"
          ? JSON.parse(row.entries_json)
          : row.entries_json,
      createdAt: row.created_at,
    }));

    if (snapshots.length === 0) {
      const emptyResult: JourneyResult = {
        stage: null,
        transitioned: false,
        progress: 0,
        checklist: [],
        score: { value: 0, label: "", insufficientData: true },
        stageHistory: [],
      };
      return NextResponse.json(emptyResult);
    }

    const latest = snapshots[snapshots.length - 1];
    const stage = classifyWealthStage(latest.netWorth);
    const progress = computeStageProgress(latest.netWorth);

    // Transition detection
    let previousStage;
    let transitioned = false;
    if (snapshots.length >= 2) {
      const prev = snapshots[snapshots.length - 2];
      const transition = detectStageTransition(latest.netWorth, prev.netWorth);
      transitioned = transition.transitioned;
      previousStage = transition.previousStage;
    }

    // Compute insights for latest snapshot context
    const insightResult = computeAllInsights(snapshots, undefined, advancedInputs);
    const bs = parseBalanceSheet(latest);

    // Evaluate checklist
    const checklist = evaluateChecklist({
      netWorth: latest.netWorth,
      stage: stage.id,
      balanceSheet: bs,
      advancedInputs,
      insightResult,
      snapshots,
    });

    // Compute score
    const scoreRaw = computeStageScore(checklist);
    const score = {
      value: scoreRaw.value,
      label: stage.scoreLabel,
      insufficientData: scoreRaw.insufficientData,
    };

    // Stage history
    const stageHistory = computeStageHistory(snapshots, advancedInputs);

    const result: JourneyResult = {
      stage,
      previousStage,
      transitioned,
      progress,
      checklist,
      score,
      stageHistory,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to compute journey" },
      { status: 500 }
    );
  }
}
