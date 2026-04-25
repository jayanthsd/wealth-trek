// @vitest-environment node
import { jsonRequest } from "@/test-utils/apiTestHelpers";

const mockGetAuthenticatedClient = vi.fn();

vi.mock("@/lib/db", () => ({
  getAuthenticatedClient: (...args: unknown[]) => mockGetAuthenticatedClient(...args),
}));

function mockSupabase() {
  const chain: Record<string, any> = {
    select: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  };
  return { from: vi.fn(() => chain), _chain: chain };
}

describe("/api/advanced-inputs route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("returns 401 when unauthenticated", async () => {
      mockGetAuthenticatedClient.mockResolvedValue({ userId: null, supabase: null });
      const { GET } = await import("./route");
      const res = await GET();
      expect(res.status).toBe(401);
    });

    it("returns empty inputs when no row exists", async () => {
      const sb = mockSupabase();
      sb._chain.single.mockResolvedValue({ data: null, error: { code: "PGRST116" } });
      mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
      const { GET } = await import("./route");
      const res = await GET();
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.inputs).toEqual({});
    });

    it("returns mapped inputs when row exists", async () => {
      const sb = mockSupabase();
      sb._chain.single.mockResolvedValue({
        data: {
          monthly_income: 100000,
          monthly_emi_total: 20000,
          monthly_investment: 15000,
          current_age: 32,
          retirement_age: 60,
          existing_term_cover: 5000000,
          existing_health_cover: 500000,
          ppf_annual_contribution: 50000,
          vpf_contribution: 10000,
          has_will_created: true,
          has_international_funds: false,
        },
        error: null,
      });
      mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
      const { GET } = await import("./route");
      const res = await GET();
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.inputs.monthly_income).toBe(100000);
      expect(body.inputs.current_age).toBe(32);
      expect(body.inputs.has_will_created).toBe(true);
    });

    it("returns 500 on unexpected DB error", async () => {
      const sb = mockSupabase();
      sb._chain.single.mockResolvedValue({ data: null, error: { code: "500", message: "DB error" } });
      mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
      const { GET } = await import("./route");
      const res = await GET();
      expect(res.status).toBe(500);
    });
  });

  describe("POST", () => {
    it("returns 401 when unauthenticated", async () => {
      mockGetAuthenticatedClient.mockResolvedValue({ userId: null, supabase: null });
      const { POST } = await import("./route");
      const req = jsonRequest("http://test/api/advanced-inputs", "POST", {});
      const res = await POST(req as never);
      expect(res.status).toBe(401);
    });

    it("upserts and returns inputs", async () => {
      const sb = mockSupabase();
      sb._chain.single.mockResolvedValue({
        data: {
          monthly_income: 80000,
          monthly_emi_total: null,
          monthly_investment: null,
          current_age: null,
          retirement_age: null,
          existing_term_cover: null,
          existing_health_cover: null,
          ppf_annual_contribution: null,
          vpf_contribution: null,
          has_will_created: false,
          has_international_funds: false,
        },
        error: null,
      });
      mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
      const { POST } = await import("./route");
      const req = jsonRequest("http://test/api/advanced-inputs", "POST", { monthly_income: 80000 });
      const res = await POST(req as never);
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.inputs.monthly_income).toBe(80000);
    });

    it("returns 500 on upsert error", async () => {
      const sb = mockSupabase();
      sb._chain.single.mockResolvedValue({ data: null, error: { message: "insert failed" } });
      mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
      const { POST } = await import("./route");
      const req = jsonRequest("http://test/api/advanced-inputs", "POST", {});
      const res = await POST(req as never);
      expect(res.status).toBe(500);
    });
  });
});
