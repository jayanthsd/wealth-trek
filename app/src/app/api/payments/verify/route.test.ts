// @vitest-environment node
import { jsonRequest } from "@/test-utils/apiTestHelpers";

const mockGetAuthenticatedClient = vi.fn();

vi.mock("@/lib/db", () => ({
  getAuthenticatedClient: (...args: unknown[]) => mockGetAuthenticatedClient(...args),
}));

vi.mock("uuid", () => ({
  v4: vi.fn(() => "sub-id"),
}));

function mockSupabase() {
  const chain: Record<string, any> = {
    insert: vi.fn().mockResolvedValue({ error: null }),
  };
  return { from: vi.fn(() => chain), _chain: chain };
}

describe("/api/payments/verify route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RAZORPAY_KEY_SECRET = "secret";
  });

  it("returns 401 for unauthenticated request", async () => {
    mockGetAuthenticatedClient.mockResolvedValue({ userId: null, supabase: null });
    const { POST } = await import("./route");
    const req = jsonRequest("http://test/api/payments/verify", "POST", {});
    const res = await POST(req as never);
    expect(res.status).toBe(401);
  });

  it("returns 400 when payment details are missing", async () => {
    const sb = mockSupabase();
    mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
    const { POST } = await import("./route");
    const req = jsonRequest("http://test/api/payments/verify", "POST", {
      plan: "professional",
      billingCycle: "monthly",
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid signature", async () => {
    const sb = mockSupabase();
    mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
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
