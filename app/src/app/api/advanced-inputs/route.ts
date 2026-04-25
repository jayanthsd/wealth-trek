import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/db";
import type { AdvancedInputs } from "@/types";

function rowToInputs(row: Record<string, unknown>): AdvancedInputs {
  const inputs: AdvancedInputs = {};
  if (row.monthly_income != null) inputs.monthly_income = row.monthly_income as number;
  if (row.monthly_emi_total != null) inputs.monthly_emi_total = row.monthly_emi_total as number;
  if (row.monthly_investment != null) inputs.monthly_investment = row.monthly_investment as number;
  if (row.current_age != null) inputs.current_age = row.current_age as number;
  if (row.retirement_age != null) inputs.retirement_age = row.retirement_age as number;
  if (row.existing_term_cover != null) inputs.existing_term_cover = row.existing_term_cover as number;
  if (row.existing_health_cover != null) inputs.existing_health_cover = row.existing_health_cover as number;
  if (row.ppf_annual_contribution != null) inputs.ppf_annual_contribution = row.ppf_annual_contribution as number;
  if (row.vpf_contribution != null) inputs.vpf_contribution = row.vpf_contribution as number;
  if (row.has_will_created != null) inputs.has_will_created = row.has_will_created as boolean;
  if (row.has_international_funds != null) inputs.has_international_funds = row.has_international_funds as boolean;
  return inputs;
}

export async function GET() {
  const { userId, supabase } = await getAuthenticatedClient();
  if (!userId || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: row, error } = await supabase
    .from("advanced_inputs")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ inputs: row ? rowToInputs(row) : {} });
}

export async function POST(request: NextRequest) {
  const { userId, supabase } = await getAuthenticatedClient();
  if (!userId || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: AdvancedInputs = await request.json();

  const { data: row, error } = await supabase
    .from("advanced_inputs")
    .upsert({
      user_id: userId,
      monthly_income: body.monthly_income ?? null,
      monthly_emi_total: body.monthly_emi_total ?? null,
      monthly_investment: body.monthly_investment ?? null,
      current_age: body.current_age ?? null,
      retirement_age: body.retirement_age ?? null,
      existing_term_cover: body.existing_term_cover ?? null,
      existing_health_cover: body.existing_health_cover ?? null,
      ppf_annual_contribution: body.ppf_annual_contribution ?? null,
      vpf_contribution: body.vpf_contribution ?? null,
      has_will_created: body.has_will_created ?? false,
      has_international_funds: body.has_international_funds ?? false,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ inputs: rowToInputs(row) });
}
