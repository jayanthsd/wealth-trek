import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient();

  const { data: row, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "not found", which is acceptable for a new user
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!row) {
    // Return default empty profile if none exists
    return NextResponse.json({
      profile: {
        fullName: "",
        address: "",
        certificateDate: "",
        asOnDate: "",
      },
    });
  }

  return NextResponse.json({
    profile: {
      fullName: row.full_name,
      address: row.address,
      certificateDate: row.certificate_date,
      asOnDate: row.as_on_date,
    },
  });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const supabase = createClient();

  const { data: row, error } = await supabase
    .from("user_profiles")
    .upsert({
      user_id: userId,
      full_name: body.fullName || "",
      address: body.address || "",
      certificate_date: body.certificateDate || "",
      as_on_date: body.asOnDate || "",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    profile: {
      fullName: row.full_name,
      address: row.address,
      certificateDate: row.certificate_date,
      asOnDate: row.as_on_date,
    },
  });
}
