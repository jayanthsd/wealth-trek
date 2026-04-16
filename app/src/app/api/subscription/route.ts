import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/db";

export async function GET() {
  const { userId, supabase } = await getAuthenticatedClient();
  if (!userId || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ subscription: null });
    }

    return NextResponse.json({
      subscription: {
        id: data.id,
        plan: data.plan,
        billingCycle: data.billing_cycle,
        status: data.status,
        expiresAt: data.expires_at,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch subscription" }, { status: 500 });
  }
}
