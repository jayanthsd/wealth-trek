import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const { data, error } = await db
      .from("snapshots")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const snapshots = (data || []).map((row: any) => ({
      id: row.id,
      date: row.date,
      totalAssets: row.total_assets,
      totalLiabilities: row.total_liabilities,
      netWorth: row.net_worth,
      entries: typeof row.entries_json === "string" ? JSON.parse(row.entries_json) : row.entries_json,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ snapshots });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch snapshots" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { date, totalAssets, totalLiabilities, netWorth, entries } = body;

  try {
    const db = getDb();

    const { data: existing } = await db
      .from("snapshots")
      .select("id")
      .eq("user_id", userId)
      .eq("date", date)
      .single();

    if (existing) {
      const { error } = await db
        .from("snapshots")
        .update({
          total_assets: totalAssets,
          total_liabilities: totalLiabilities,
          net_worth: netWorth,
          entries_json: JSON.stringify(entries),
        })
        .eq("id", existing.id)
        .eq("user_id", userId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        snapshot: {
          id: existing.id,
          date,
          totalAssets,
          totalLiabilities,
          netWorth,
          entries,
          createdAt: new Date().toISOString(),
        },
      });
    }

    const id = uuidv4();
    const { error } = await db.from("snapshots").insert({
      id,
      user_id: userId,
      date,
      total_assets: totalAssets,
      total_liabilities: totalLiabilities,
      net_worth: netWorth,
      entries_json: JSON.stringify(entries),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        snapshot: {
          id,
          date,
          totalAssets,
          totalLiabilities,
          netWorth,
          entries,
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create snapshot" }, { status: 500 });
  }
}
