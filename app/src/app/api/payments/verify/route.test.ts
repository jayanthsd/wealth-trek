// @vitest-environment node
import { auth } from "@clerk/nextjs/server";
import { jsonRequest } from "@/test-utils/apiTestHelpers";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

const run = vi.fn();
const prepare = vi.fn(() => ({ run }));

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(() => ({ prepare })),
}));

vi.mock("uuid", () => ({
  v4: vi.fn(() => "sub-id"),
}));

describe("/api/payments/verify route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RAZORPAY_KEY_SECRET = "secret";
  });

  it("returns 401 for unauthenticated request", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never);
    const { POST } = await import("./route");
    const req = jsonRequest("http://test/api/payments/verify", "POST", {});
    const res = await POST(req as never);
    expect(res.status).toBe(401);
  });

  it("returns 400 when payment details are missing", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "u1" } as never);
    const { POST } = await import("./route");
    const req = jsonRequest("http://test/api/payments/verify", "POST", {
      plan: "professional",
      billingCycle: "monthly",
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid signature", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "u1" } as never);
    const { POST } = await import("./route");
    const req = jsonRequest("http://test/api/payments/verify", "POST", {
      razorpay_order_id: "ord_1",
      razorpay_payment_id: "pay_1",
      razorpay_signature: "bad",
      plan: "professional",
      billingCycle: "monthly",
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });
});
