import { PLANS, PAID_PLANS, isPaidPlan, getPlanAmount } from "@/lib/pricing";

describe("pricing", () => {
  describe("PLANS", () => {
    it("defines free, professional, and enterprise plans", () => {
      expect(Object.keys(PLANS)).toEqual(["free", "professional", "enterprise"]);
    });

    it("free plan has zero pricing for both cycles", () => {
      expect(PLANS.free.pricing.monthly.amount).toBe(0);
      expect(PLANS.free.pricing.yearly.amount).toBe(0);
    });

    it("professional plan has correct monthly amount (25000 paise = ₹250)", () => {
      expect(PLANS.professional.pricing.monthly.amount).toBe(25000);
      expect(PLANS.professional.pricing.monthly.display).toBe("₹250");
    });

    it("professional plan has correct yearly amount (250000 paise = ₹2,500)", () => {
      expect(PLANS.professional.pricing.yearly.amount).toBe(250000);
      expect(PLANS.professional.pricing.yearly.display).toBe("₹2,500");
    });

    it("enterprise plan has correct monthly amount (499900 paise = ₹4,999)", () => {
      expect(PLANS.enterprise.pricing.monthly.amount).toBe(499900);
      expect(PLANS.enterprise.pricing.monthly.display).toBe("₹4,999");
    });

    it("enterprise plan has correct yearly amount (4999000 paise = ₹49,990)", () => {
      expect(PLANS.enterprise.pricing.yearly.amount).toBe(4999000);
      expect(PLANS.enterprise.pricing.yearly.display).toBe("₹49,990");
    });

    it("yearly professional plan is cheaper than 12x monthly", () => {
      const monthly12x = PLANS.professional.pricing.monthly.amount * 12;
      expect(PLANS.professional.pricing.yearly.amount).toBeLessThan(monthly12x);
    });

    it("yearly enterprise plan is cheaper than 12x monthly", () => {
      const monthly12x = PLANS.enterprise.pricing.monthly.amount * 12;
      expect(PLANS.enterprise.pricing.yearly.amount).toBeLessThan(monthly12x);
    });
  });

  describe("PAID_PLANS", () => {
    it("contains professional and enterprise", () => {
      expect(PAID_PLANS).toContain("professional");
      expect(PAID_PLANS).toContain("enterprise");
    });

    it("does not contain free", () => {
      expect(PAID_PLANS).not.toContain("free");
    });
  });

  describe("isPaidPlan", () => {
    it("returns true for professional", () => {
      expect(isPaidPlan("professional")).toBe(true);
    });

    it("returns true for enterprise", () => {
      expect(isPaidPlan("enterprise")).toBe(true);
    });

    it("returns false for free", () => {
      expect(isPaidPlan("free")).toBe(false);
    });

    it("returns false for unknown plan strings", () => {
      expect(isPaidPlan("unknown")).toBe(false);
      expect(isPaidPlan("")).toBe(false);
    });
  });

  describe("getPlanAmount", () => {
    it("returns 0 for free monthly", () => {
      expect(getPlanAmount("free", "monthly")).toBe(0);
    });

    it("returns 0 for free yearly", () => {
      expect(getPlanAmount("free", "yearly")).toBe(0);
    });

    it("returns professional monthly amount", () => {
      expect(getPlanAmount("professional", "monthly")).toBe(25000);
    });

    it("returns professional yearly amount", () => {
      expect(getPlanAmount("professional", "yearly")).toBe(250000);
    });

    it("returns enterprise monthly amount", () => {
      expect(getPlanAmount("enterprise", "monthly")).toBe(499900);
    });

    it("returns enterprise yearly amount", () => {
      expect(getPlanAmount("enterprise", "yearly")).toBe(4999000);
    });
  });
});
