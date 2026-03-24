import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();

  const existing = db
    .prepare("SELECT * FROM statements WHERE id = ? AND user_id = ?")
    .get(id, userId) as Record<string, unknown> | undefined;

  if (!existing) {
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
    const setClauses = Object.keys(updates)
      .map((col) => `${col} = ?`)
      .join(", ");
    const values = Object.values(updates);

    db.prepare(
      `UPDATE statements SET ${setClauses}, updated_at = datetime('now') WHERE id = ? AND user_id = ?`
    ).run(...values, id, userId);
  }

  const updated = db
    .prepare("SELECT * FROM statements WHERE id = ? AND user_id = ?")
    .get(id, userId) as Record<string, unknown>;

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
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();

  const result = db
    .prepare("DELETE FROM statements WHERE id = ? AND user_id = ?")
    .run(id, userId);

  if (result.changes === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
