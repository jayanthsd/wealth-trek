import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Razorpay from "razorpay";
import { isPaidPlan, getPlanAmount, type PlanId, type BillingCycle } from "@/lib/pricing";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { plan, billingCycle } = body as { plan: string; billingCycle: string };

  if (!plan || !billingCycle) {
    return NextResponse.json(
      { error: "Missing plan or billingCycle" },
      { status: 400 }
    );
  }

  if (!isPaidPlan(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  if (billingCycle !== "monthly" && billingCycle !== "yearly") {
    return NextResponse.json(
      { error: "Invalid billing cycle" },
      { status: 400 }
    );
  }

  const amount = getPlanAmount(plan as PlanId, billingCycle as BillingCycle);

  try {
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      notes: {
        userId,
        plan,
        billingCycle,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}