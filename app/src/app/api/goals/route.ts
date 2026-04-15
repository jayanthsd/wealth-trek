import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient();

  const { data: rows, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const goals = (rows ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    targetAmount: row.target_amount,
    targetDate: row.target_date,
    createdAt: row.created_at,
    status: row.status,
  }));

  return NextResponse.json({ goals });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const entries: Array<{
    title: string;
    description: string;
    targetAmount?: number;
    targetDate?: string;
    status?: string;
  }> = Array.isArray(body) ? body : [body];

  const supabase = createClient();

  const insertRows = entries.map((entry) => ({
    user_id: userId,
    title: entry.title,
    description: entry.description,
    target_amount: entry.targetAmount || null,
    target_date: entry.targetDate || null,
    status: entry.status || "active",
  }));

  const { data: rows, error } = await supabase
    .from("goals")
    .insert(insertRows)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const created = (rows ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    targetAmount: row.target_amount,
    targetDate: row.target_date,
    createdAt: row.created_at,
    status: row.status,
  }));

  return NextResponse.json({ goals: created }, { status: 201 });
}
