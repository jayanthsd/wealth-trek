import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/db";

export async function GET() {
  const { userId, supabase } = await getAuthenticatedClient();
  if (!userId || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: rows, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("user_id", userId)
    .order("timestamp", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const messages = (rows ?? []).map((row) => ({
    id: row.id,
    role: row.role,
    content: row.content,
    timestamp: row.timestamp,
    suggestedGoal: row.suggested_goal_json || undefined,
  }));

  return NextResponse.json({ messages });
}

export async function POST(request: NextRequest) {
  const { userId, supabase } = await getAuthenticatedClient();
  if (!userId || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const entries: Array<{
    role: string;
    content: string;
    suggestedGoal?: object;
  }> = Array.isArray(body) ? body : [body];

  const insertRows = entries.map((entry) => ({
    user_id: userId,
    role: entry.role,
    content: entry.content,
    suggested_goal_json: entry.suggestedGoal || null,
  }));

  const { data: rows, error } = await supabase
    .from("chat_messages")
    .insert(insertRows)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const created = (rows ?? []).map((row) => ({
    id: row.id,
    role: row.role,
    content: row.content,
    timestamp: row.timestamp,
    suggestedGoal: row.suggested_goal_json || undefined,
  }));

  return NextResponse.json({ messages: created }, { status: 201 });
}
