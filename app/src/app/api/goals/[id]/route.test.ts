// @vitest-environment node
import { jsonRequest } from "@/test-utils/apiTestHelpers";

const mockGetAuthenticatedClient = vi.fn();

vi.mock("@/lib/db", () => ({
  getAuthenticatedClient: (...args: unknown[]) => mockGetAuthenticatedClient(...args),
}));

function mockSupabase() {
  const chain: Record<string, any> = {
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn(),
  };
  return { from: vi.fn(() => chain), _chain: chain };
}

describe("/api/goals/[id] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("PUT", () => {
    it("returns 401 when unauthenticated", async () => {
      mockGetAuthenticatedClient.mockResolvedValue({ userId: null, supabase: null });
      const { PUT } = await import("./route");
      const req = jsonRequest("http://test/api/goals/g1", "PUT", {});
      const res = await PUT(req as never, { params: Promise.resolve({ id: "g1" }) });
      expect(res.status).toBe(401);
    });

    it("updates a goal and returns updated data", async () => {
      const sb = mockSupabase();
      sb._chain.single.mockResolvedValue({
        data: {
          id: "g1",
          title: "Updated Title",
          description: "Updated desc",
          target_amount: 200000,
          target_date: "2028-01-01",
          created_at: "2026-01-01T00:00:00Z",
          status: "completed",
        },
        error: null,
      });
      mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
      const { PUT } = await import("./route");
      const req = jsonRequest("http://test/api/goals/g1", "PUT", { title: "Updated Title", status: "completed" });
      const res = await PUT(req as never, { params: Promise.resolve({ id: "g1" }) });
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.goal.title).toBe("Updated Title");
      expect(body.goal.status).toBe("completed");
    });

    it("returns 404 when goal not found", async () => {
      const sb = mockSupabase();
      sb._chain.single.mockResolvedValue({ data: null, error: { message: "not found" } });
      mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
      const { PUT } = await import("./route");
      const req = jsonRequest("http://test/api/goals/unknown", "PUT", { title: "x" });
      const res = await PUT(req as never, { params: Promise.resolve({ id: "unknown" }) });
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE", () => {
    it("returns 401 when unauthenticated", async () => {
      mockGetAuthenticatedClient.mockResolvedValue({ userId: null, supabase: null });
      const { DELETE } = await import("./route");
      const req = jsonRequest("http://test/api/goals/g1", "DELETE", {});
      const res = await DELETE(req as never, { params: Promise.resolve({ id: "g1" }) });
      expect(res.status).toBe(401);
    });

    it("deletes a goal and returns success", async () => {
      const sb = mockSupabase();
      sb._chain.single.mockResolvedValue({ data: { id: "g1" }, error: null });
      mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
      const { DELETE } = await import("./route");
      const req = jsonRequest("http://test/api/goals/g1", "DELETE", {});
      const res = await DELETE(req as never, { params: Promise.resolve({ id: "g1" }) });
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
    });

    it("returns 404 when goal not found", async () => {
      const sb = mockSupabase();
      sb._chain.single.mockResolvedValue({ data: null, error: { message: "not found" } });
      mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
      const { DELETE } = await import("./route");
      const req = jsonRequest("http://test/api/goals/unknown", "DELETE", {});
      const res = await DELETE(req as never, { params: Promise.resolve({ id: "unknown" }) });
      expect(res.status).toBe(404);
    });
  });
});
