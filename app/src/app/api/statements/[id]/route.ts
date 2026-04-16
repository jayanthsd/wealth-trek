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

  try {
    const { id } = await params;

    const { data: existing, error: fetchError } = await supabase
      .from("statements")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.statementType !== undefined) updates.statement_type = body.statementType;
    if (body.description !== undefined) updates.description = body.description;
    if (body.category !== undefined) updates.category = body.category;
    if (body.closingBalance !== undefined) updates.closing_balance = body.closingBalance;
    if (body.ownershipPercentage !== undefined) updates.ownership_percentage = body.ownershipPercentage;
    if (body.sourceDocumentId !== undefined) updates.source_document_id = body.sourceDocumentId;

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from("statements")
        .update(updates)
        .eq("id", id)
        .eq("user_id", userId);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }

    const { data: updated, error: refetchError } = await supabase
      .from("statements")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (refetchError || !updated) {
      return NextResponse.json({ error: "Failed to fetch updated statement" }, { status: 500 });
    }

    return NextResponse.json({
      statement: {
        id: updated.id,
        statementType: updated.statement_type,
        description: updated.description,
        category: updated.category,
        closingBalance: updated.closing_balance,
        ownershipPercentage: updated.ownership_percentage,
        sourceDocumentId: updated.source_document_id || undefined,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update statement" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, supabase } = await getAuthenticatedClient();
  if (!userId || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const { error, count } = await supabase
      .from("statements")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!count || count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete statement" }, { status: 500 });
  }
}
