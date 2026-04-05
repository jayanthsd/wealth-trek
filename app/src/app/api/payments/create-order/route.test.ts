// @vitest-environment node
import { auth } from "@clerk/nextjs/server";
import { jsonRequest } from "@/test-utils/apiTestHelpers";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

const ordersCreate = vi.fn();
vi.mock("razorpay", () => ({
  default: vi.fn(function Razorpay() {
    return {
      orders: {
        create: ordersCreate,
      },
    };
  }),
}));

describe("/api/payments/create-order route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RAZORPAY_KEY_ID = "rzp_test_x";
    process.env.RAZORPAY_KEY_SECRET = "secret";
  });

  it("returns 401 for unauthenticated request", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never);
    const { POST } = await import("./route");
    const req = jsonRequest("http://test/api/payments/create-order", "POST", {
      plan: "professional",
      billingCycle: "monthly",
    });
    const res = await POST(req as never);
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid plan", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "u1" } as never);
    const { POST } = await import("./route");
    const req = jsonRequest("http://test/api/payments/create-order", "POST", {
      plan: "free",
      billingCycle: "monthly",
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it("returns order details on success", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "u1" } as never);
    ordersCreate.mockResolvedValue({ id: "ord_1", amount: 25000, currency: "INR" });
    const { POST } = await import("./route");
    const req = jsonRequest("http://test/api/payments/create-order", "POST", {
      plan: "professional",
      billingCycle: "monthly",
    });
    const res = await POST(req as never);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.orderId).toBe("ord_1");
  });
});
