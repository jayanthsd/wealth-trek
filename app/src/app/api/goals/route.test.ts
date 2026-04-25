// @vitest-environment node
import { jsonRequest } from "@/test-utils/apiTestHelpers";

const mockGetAuthenticatedClient = vi.fn();

vi.mock("@/lib/db", () => ({
  getAuthenticatedClient: (...args: unknown[]) => mockGetAuthenticatedClient(...args),
}));

function mockSupabase() {
  const chain: Record<string, any> = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
  };
  return { from: vi.fn(() => chain), _chain: chain };
}

describe("/api/goals route", () => {
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

    it("returns empty goals array when none exist", async () => {
      const sb = mockSupabase();
      sb._chain.order.mockResolvedValue({ data: [], error: null });
      mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
      const { GET } = await import("./route");
      const res = await GET();
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.goals).toEqual([]);
    });

    it("maps rows to goal objects", async () => {
      const sb = mockSupabase();
      sb._chain.order.mockResolvedValue({
        data: [
          {
            id: "g1",
            title: "Buy house",
            description: "Save for down payment",
            target_amount: 1000000,
            target_date: "2030-01-01",
            created_at: "2026-01-01T00:00:00Z",
            status: "active",
          },
        ],
        error: null,
      });
      mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
      const { GET } = await import("./route");
      const res = await GET();
      const body = await res.json();
      expect(body.goals[0]).toMatchObject({
        id: "g1",
        title: "Buy house",
        targetAmount: 1000000,
        status: "active",
      });
    });

    it("returns 500 on DB error", async () => {
      const sb = mockSupabase();
      sb._chain.order.mockResolvedValue({ data: null, error: { message: "query failed" } });
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
      const req = jsonRequest("http://test/api/goals", "POST", {});
      const res = await POST(req as never);
      expect(res.status).toBe(401);
    });

    it("creates a single goal and returns 201", async () => {
      const sb = mockSupabase();
      sb._chain.insert.mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [
            {
              id: "g1",
              title: "Emergency fund",
              description: "3 months expenses",
              target_amount: 150000,
              target_date: null,
              created_at: "2026-01-01T00:00:00Z",
              status: "active",
            },
          ],
          error: null,
        }),
      });
      mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
      const { POST } = await import("./route");
      const req = jsonRequest("http://test/api/goals", "POST", {
        title: "Emergency fund",
        description: "3 months expenses",
        targetAmount: 150000,
      });
      const res = await POST(req as never);
      const body = await res.json();
      expect(res.status).toBe(201);
      expect(body.goals[0].title).toBe("Emergency fund");
    });

    it("creates multiple goals from array body", async () => {
      const sb = mockSupabase();
      sb._chain.insert.mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [
            { id: "g1", title: "Goal A", description: "", target_amount: null, target_date: null, created_at: "2026-01-01T00:00:00Z", status: "active" },
            { id: "g2", title: "Goal B", description: "", target_amount: null, target_date: null, created_at: "2026-01-01T00:00:00Z", status: "active" },
          ],
          error: null,
        }),
      });
      mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
      const { POST } = await import("./route");
      const req = jsonRequest("http://test/api/goals", "POST", [
        { title: "Goal A", description: "" },
        { title: "Goal B", description: "" },
      ]);
      const res = await POST(req as never);
      const body = await res.json();
      expect(res.status).toBe(201);
      expect(body.goals).toHaveLength(2);
    });

    it("defaults status to active when not provided", async () => {
      const sb = mockSupabase();
      let capturedRows: any[];
      sb._chain.insert.mockImplementation((rows: any[]) => {
        capturedRows = rows;
        return { select: vi.fn().mockResolvedValue({ data: rows.map((r, i) => ({ ...r, id: `g${i}`, created_at: "" })), error: null }) };
      });
      mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
      const { POST } = await import("./route");
      const req = jsonRequest("http://test/api/goals", "POST", { title: "Save", description: "" });
      await POST(req as never);
      expect(capturedRows![0].status).toBe("active");
    });

    it("returns 500 on insert error", async () => {
      const sb = mockSupabase();
      sb._chain.insert.mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: null, error: { message: "insert failed" } }),
      });
      mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
      const { POST } = await import("./route");
      const req = jsonRequest("http://test/api/goals", "POST", { title: "x", description: "" });
      const res = await POST(req as never);
      expect(res.status).toBe(500);
    });
  });
});
