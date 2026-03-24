import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM snapshots WHERE user_id = ? ORDER BY date ASC")
    .all(userId) as Record<string, unknown>[];

  const snapshots = rows.map((row) => ({
    id: row.id,
    date: row.date,
    totalAssets: row.total_assets,
    totalLiabilities: row.total_liabilities,
    netWorth: row.net_worth,
    entries: JSON.parse(row.entries_json as string),
    createdAt: row.created_at,
  }));

  return NextResponse.json({ snapshots });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { date, totalAssets, totalLiabilities, netWorth, entries } = body;

  const db = getDb();

  const existing = db
    .prepare("SELECT id FROM snapshots WHERE user_id = ? AND date = ?")
    .get(userId, date) as { id: string } | undefined;

  if (existing) {
    db.prepare(
      `UPDATE snapshots SET total_assets = ?, total_liabilities = ?, net_worth = ?, entries_json = ?, created_at = datetime('now') WHERE id = ? AND user_id = ?`
    ).run(totalAssets, totalLiabilities, netWorth, JSON.stringify(entries), existing.id, userId);

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
  db.prepare(
    `INSERT INTO snapshots (id, user_id, date, total_assets, total_liabilities, net_worth, entries_json) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, userId, date, totalAssets, totalLiabilities, netWorth, JSON.stringify(entries));

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
}
