import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAuthenticatedClient } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { isPaidPlan, getPlanAmount, type PlanId, type BillingCycle } from "@/lib/pricing";

export async function POST(request: NextRequest) {
  const { userId, supabase } = await getAuthenticatedClient();
  if (!userId || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    plan,
    billingCycle,
  } = body as {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    plan: string;
    billingCycle: string;
  };

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json(
      { error: "Missing payment details" },
      { status: 400 }
    );
  }

  if (!plan || !isPaidPlan(plan) || !billingCycle) {
    return NextResponse.json(
      { error: "Invalid plan or billing cycle" },
      { status: 400 }
    );
  }

  // Verify HMAC-SHA256 signature
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json(
      { error: "Invalid payment signature" },
      { status: 400 }
    );
  }

  // Calculate expiry date
  const now = new Date();
  const expiresAt = new Date(now);
  if (billingCycle === "yearly") {
    expiresAt.setDate(expiresAt.getDate() + 365);
  } else {
    expiresAt.setDate(expiresAt.getDate() + 30);
  }

  const amount = getPlanAmount(plan as PlanId, billingCycle as BillingCycle);

  try {
    const id = uuidv4();

    const { error } = await supabase.from("subscriptions").insert({
      id,
      user_id: userId,
      razorpay_order_id,
      razorpay_payment_id,
      plan,
      billing_cycle: billingCycle,
      amount,
      currency: "INR",
      status: "active",
      expires_at: expiresAt.toISOString(),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id,
        plan,
        billingCycle,
        status: "active",
        expiresAt: expiresAt.toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create subscription" }, { status: 500 });
  }
}
