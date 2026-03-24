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
    .prepare("SELECT * FROM statements WHERE user_id = ? ORDER BY created_at ASC")
    .all(userId);

  const statements = (rows as Record<string, unknown>[]).map((row) => ({
    id: row.id,
    statementType: row.statement_type,
    description: row.description,
    category: row.category,
    closingBalance: row.closing_balance,
    ownershipPercentage: row.ownership_percentage,
    sourceDocumentId: row.source_document_id || undefined,
  }));

  return NextResponse.json({ statements });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const entries: Array<{
    statementType: string;
    description: string;
    category: string;
    closingBalance: number;
    ownershipPercentage: number;
    sourceDocumentId?: string;
  }> = Array.isArray(body) ? body : [body];

  const db = getDb();
  const insert = db.prepare(`
    INSERT INTO statements (id, user_id, statement_type, description, category, closing_balance, ownership_percentage, source_document_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const created: Array<{
    id: string;
    statementType: string;
    description: string;
    category: string;
    closingBalance: number;
    ownershipPercentage: number;
    sourceDocumentId?: string;
  }> = [];

  const insertMany = db.transaction(() => {
    for (const entry of entries) {
      const id = uuidv4();
      insert.run(
        id,
        userId,
        entry.statementType,
        entry.description,
        entry.category,
        entry.closingBalance,
        entry.ownershipPercentage,
        entry.sourceDocumentId || null
      );
      created.push({
        id,
        statementType: entry.statementType,
        description: entry.description,
        category: entry.category,
        closingBalance: entry.closingBalance,
        ownershipPercentage: entry.ownershipPercentage,
        sourceDocumentId: entry.sourceDocumentId,
      });
    }
  });

  insertMany();

  return NextResponse.json({ statements: created }, { status: 201 });
}
