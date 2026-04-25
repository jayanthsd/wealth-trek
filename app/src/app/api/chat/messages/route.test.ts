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
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
  };
  return { from: vi.fn(() => chain), _chain: chain };
}

describe("/api/chat/messages route", () => {
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

    it("returns empty messages array when no rows", async () => {
      const sb = mockSupabase();
      sb._chain.order.mockResolvedValue({ data: [], error: null });
      mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
      const { GET } = await import("./route");
      const res = await GET();
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.messages).toEqual([]);
    });

    it("maps rows to message objects", async () => {
      const sb = mockSupabase();
      sb._chain.order.mockResolvedValue({
        data: [
          { id: "m1", role: "user", content: "Hello", timestamp: "2026-01-01T00:00:00Z", suggested_goal_json: null },
          { id: "m2", role: "assistant", content: "Hi!", timestamp: "2026-01-01T00:00:01Z", suggested_goal_json: null },
        ],
        error: null,
      });
      mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
      const { GET } = await import("./route");
      const res = await GET();
      const body = await res.json();
      expect(body.messages).toHaveLength(2);
      expect(body.messages[0]).toMatchObject({ id: "m1", role: "user", content: "Hello" });
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

  describe("DELETE", () => {
    it("returns 401 when unauthenticated", async () => {
      mockGetAuthenticatedClient.mockResolvedValue({ userId: null, supabase: null });
      const { DELETE } = await import("./route");
      const res = await DELETE();
      expect(res.status).toBe(401);
    });

    it("deletes all messages for user", async () => {
      const sb = mockSupabase();
      sb._chain.eq.mockResolvedValue({ error: null });
      mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
      const { DELETE } = await import("./route");
      const res = await DELETE();
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
    });

    it("returns 500 on delete error", async () => {
      const sb = mockSupabase();
      sb._chain.eq.mockResolvedValue({ error: { message: "delete failed" } });
      mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
      const { DELETE } = await import("./route");
      const res = await DELETE();
      expect(res.status).toBe(500);
    });
  });

  describe("POST", () => {
    it("returns 401 when unauthenticated", async () => {
      mockGetAuthenticatedClient.mockResolvedValue({ userId: null, supabase: null });
      const { POST } = await import("./route");
      const req = jsonRequest("http://test/api/chat/messages", "POST", []);
      const res = await POST(req as never);
      expect(res.status).toBe(401);
    });

    it("inserts a single message and returns 201", async () => {
      const sb = mockSupabase();
      sb._chain.insert.mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [{ id: "m1", role: "user", content: "Hello", timestamp: "2026-01-01T00:00:00Z", suggested_goal_json: null }],
          error: null,
        }),
      });
      mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
      const { POST } = await import("./route");
      const req = jsonRequest("http://test/api/chat/messages", "POST", { role: "user", content: "Hello" });
      const res = await POST(req as never);
      const body = await res.json();
      expect(res.status).toBe(201);
      expect(body.messages[0].content).toBe("Hello");
    });

    it("inserts multiple messages from array body", async () => {
      const sb = mockSupabase();
      sb._chain.insert.mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [
            { id: "m1", role: "user", content: "Hello", timestamp: "2026-01-01T00:00:00Z", suggested_goal_json: null },
            { id: "m2", role: "assistant", content: "Hi", timestamp: "2026-01-01T00:00:01Z", suggested_goal_json: null },
          ],
          error: null,
        }),
      });
      mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
      const { POST } = await import("./route");
      const req = jsonRequest("http://test/api/chat/messages", "POST", [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi" },
      ]);
      const res = await POST(req as never);
      const body = await res.json();
      expect(res.status).toBe(201);
      expect(body.messages).toHaveLength(2);
    });

    it("returns 500 on insert error", async () => {
      const sb = mockSupabase();
      sb._chain.insert.mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: null, error: { message: "insert failed" } }),
      });
      mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
      const { POST } = await import("./route");
      const req = jsonRequest("http://test/api/chat/messages", "POST", { role: "user", content: "Hello" });
      const res = await POST(req as never);
      expect(res.status).toBe(500);
    });
  });
});
