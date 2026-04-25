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

describe("/api/profile route", () => {
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

    it("returns default empty profile when no row exists", async () => {
      const sb = mockSupabase();
      sb._chain.single.mockResolvedValue({ data: null, error: { code: "PGRST116" } });
      mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
      const { GET } = await import("./route");
      const res = await GET();
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.profile).toEqual({ fullName: "", address: "", certificateDate: "", asOnDate: "" });
    });

    it("returns existing profile", async () => {
      const sb = mockSupabase();
      sb._chain.single.mockResolvedValue({
        data: {
          full_name: "John Doe",
          address: "123 Main St",
          certificate_date: "2026-01-01",
          as_on_date: "2025-12-31",
        },
        error: null,
      });
      mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
      const { GET } = await import("./route");
      const res = await GET();
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.profile).toEqual({
        fullName: "John Doe",
        address: "123 Main St",
        certificateDate: "2026-01-01",
        asOnDate: "2025-12-31",
      });
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
      const req = jsonRequest("http://test/api/profile", "POST", {});
      const res = await POST(req as never);
      expect(res.status).toBe(401);
    });

    it("upserts profile and returns saved data", async () => {
      const sb = mockSupabase();
      sb._chain.single.mockResolvedValue({
        data: {
          full_name: "Jane Doe",
          address: "456 Oak Ave",
          certificate_date: "2026-04-25",
          as_on_date: "2026-03-31",
        },
        error: null,
      });
      mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
      const { POST } = await import("./route");
      const req = jsonRequest("http://test/api/profile", "POST", {
        fullName: "Jane Doe",
        address: "456 Oak Ave",
        certificateDate: "2026-04-25",
        asOnDate: "2026-03-31",
      });
      const res = await POST(req as never);
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.profile.fullName).toBe("Jane Doe");
      expect(body.profile.asOnDate).toBe("2026-03-31");
    });

    it("returns 500 on upsert error", async () => {
      const sb = mockSupabase();
      sb._chain.single.mockResolvedValue({ data: null, error: { message: "upsert failed" } });
      mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
      const { POST } = await import("./route");
      const req = jsonRequest("http://test/api/profile", "POST", { fullName: "x" });
      const res = await POST(req as never);
      expect(res.status).toBe(500);
    });
  });
});
