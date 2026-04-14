import { PLANS, PAID_PLANS, isPaidPlan, getPlanAmount, PlanId, BillingCycle } from "@/lib/pricing";

describe("pricing", () => {
  describe("PLANS configuration", () => {
    it("has all three plan types", () => {
      expect(Object.keys(PLANS)).toEqual(["free", "professional", "enterprise"]);
    });

    it("has correct free plan details", () => {
      expect(PLANS.free.id).toBe("free");
      expect(PLANS.free.name).toBe("Free");
      expect(PLANS.free.pricing.monthly.amount).toBe(0);
      expect(PLANS.free.pricing.yearly.amount).toBe(0);
    });

    it("has correct professional plan monthly pricing", () => {
      expect(PLANS.professional.id).toBe("professional");
      expect(PLANS.professional.name).toBe("Professional");
      expect(PLANS.professional.pricing.monthly.amount).toBe(25000);
      expect(PLANS.professional.pricing.monthly.display).toBe("₹250");
      expect(PLANS.professional.pricing.monthly.billing).toBe("per month");
    });

    it("has correct professional plan yearly pricing", () => {
      expect(PLANS.professional.pricing.yearly.amount).toBe(250000);
      expect(PLANS.professional.pricing.yearly.display).toBe("₹2,500");
      expect(PLANS.professional.pricing.yearly.billing).toBe("per year");
    });

    it("has correct enterprise plan monthly pricing", () => {
      expect(PLANS.enterprise.id).toBe("enterprise");
      expect(PLANS.enterprise.name).toBe("Enterprise");
      expect(PLANS.enterprise.pricing.monthly.amount).toBe(499900);
      expect(PLANS.enterprise.pricing.monthly.display).toBe("₹4,999");
    });

    it("has correct enterprise plan yearly pricing", () => {
      expect(PLANS.enterprise.pricing.yearly.amount).toBe(4999000);
      expect(PLANS.enterprise.pricing.yearly.display).toBe("₹49,990");
    });
  });

  describe("PAID_PLANS", () => {
    it("contains only professional and enterprise", () => {
      expect(PAID_PLANS).toEqual(["professional", "enterprise"]);
      expect(PAID_PLANS).not.toContain("free");
    });
  });

  describe("isPaidPlan", () => {
    it("returns true for professional plan", () => {
      expect(isPaidPlan("professional")).toBe(true);
    });

    it("returns true for enterprise plan", () => {
      expect(isPaidPlan("enterprise")).toBe(true);
    });

    it("returns false for free plan", () => {
      expect(isPaidPlan("free")).toBe(false);
    });

    it("returns false for unknown plan", () => {
      expect(isPaidPlan("unknown")).toBe(false);
    });
  });

  describe("getPlanAmount", () => {
    it("returns correct amount for free plan monthly", () => {
      expect(getPlanAmount("free", "monthly")).toBe(0);
    });

    it("returns correct amount for free plan yearly", () => {
      expect(getPlanAmount("free", "yearly")).toBe(0);
    });

    it("returns correct amount for professional monthly", () => {
      expect(getPlanAmount("professional", "monthly")).toBe(25000);
    });

    it("returns correct amount for professional yearly", () => {
      expect(getPlanAmount("professional", "yearly")).toBe(250000);
    });

    it("returns correct amount for enterprise monthly", () => {
      expect(getPlanAmount("enterprise", "monthly")).toBe(499900);
    });

    it("returns correct amount for enterprise yearly", () => {
      expect(getPlanAmount("enterprise", "yearly")).toBe(4999000);
    });
  });
});