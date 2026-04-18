import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/db";

export async function GET() {
  const { userId, supabase } = await getAuthenticatedClient();
  if (!userId || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from("popular_banks")
      .select("id, name")
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ banks: data || [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch banks" },
      { status: 500 }
    );
  }
}
