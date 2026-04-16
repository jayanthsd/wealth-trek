import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  const { userId, supabase } = await getAuthenticatedClient();
  if (!userId || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from("statements")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const statements = (data || []).map((row: any) => ({
      id: row.id,
      statementType: row.statement_type,
      description: row.description,
      category: row.category,
      closingBalance: row.closing_balance,
      ownershipPercentage: row.ownership_percentage,
      sourceDocumentId: row.source_document_id || undefined,
    }));

    return NextResponse.json({ statements });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch statements" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { userId, supabase } = await getAuthenticatedClient();
  if (!userId || !supabase) {
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

  try {
    const created: Array<{
      id: string;
      statementType: string;
      description: string;
      category: string;
      closingBalance: number;
      ownershipPercentage: number;
      sourceDocumentId?: string;
    }> = [];

    const insertData = entries.map((entry) => ({
      id: uuidv4(),
      user_id: userId,
      statement_type: entry.statementType,
      description: entry.description,
      category: entry.category,
      closing_balance: entry.closingBalance,
      ownership_percentage: entry.ownershipPercentage,
      source_document_id: entry.sourceDocumentId || null,
    }));

    const { data, error } = await supabase.from("statements").insert(insertData).select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    (data || []).forEach((row: any) => {
      created.push({
        id: row.id,
        statementType: row.statement_type,
        description: row.description,
        category: row.category,
        closingBalance: row.closing_balance,
        ownershipPercentage: row.ownership_percentage,
        sourceDocumentId: row.source_document_id,
      });
    });

    return NextResponse.json({ statements: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create statements" }, { status: 500 });
  }
}
