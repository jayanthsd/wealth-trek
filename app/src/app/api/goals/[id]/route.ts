import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, supabase } = await getAuthenticatedClient();
  if (!userId || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.targetAmount !== undefined) updates.target_amount = body.targetAmount;
  if (body.targetDate !== undefined) updates.target_date = body.targetDate;
  if (body.status !== undefined) updates.status = body.status;

  const { data: updated, error } = await supabase
    .from("goals")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error || !updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    goal: {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      targetAmount: updated.target_amount,
      targetDate: updated.target_date,
      createdAt: updated.created_at,
      status: updated.status,
    },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, supabase } = await getAuthenticatedClient();
  if (!userId || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data, error } = await supabase
    .from("goals")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
