// @vitest-environment node
import { auth } from "@clerk/nextjs/server";
import { jsonRequest } from "@/test-utils/apiTestHelpers";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

const all = vi.fn();
const get = vi.fn();
const run = vi.fn();
const prepare = vi.fn((sql: string) => {
  if (sql.includes("SELECT * FROM snapshots")) return { all };
  if (sql.includes("SELECT id FROM snapshots")) return { get };
  return { run };
});

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(() => ({ prepare })),
}));

vi.mock("uuid", () => ({
  v4: vi.fn(() => "snap-id"),
}));

describe("/api/snapshots route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe("GET /api/snapshots", () => {
    it("returns 401 for unauthenticated GET", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never);
      const { GET } = await import("./route");
      const res = await GET();
      expect(res.status).toBe(401);
    });

    it("returns snapshots for authenticated GET", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "u1" } as never);
      all.mockReturnValue([
        {
          id: "s1",
          user_id: "u1",
          date: "2026-01-01",
          total_assets: 1000,
          total_liabilities: 200,
          net_worth: 800,
          entries_json: "[]",
          created_at: "2026-01-01T00:00:00.000Z",
        },
        {
          id: "s2",
          user_id: "u1",
          date: "2025-06-01",
          total_assets: 800,
          total_liabilities: 150,
          net_worth: 650,
          entries_json: "[]",
          created_at: "2025-06-01T00:00:00.000Z",
        },
      ]);
      const { GET } = await import("./route");
      const res = await GET();
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.snapshots).toHaveLength(2);
      expect(body.snapshots[0].id).toBe("s1");
      expect(body.snapshots[0].totalAssets).toBe(1000);
      expect(body.snapshots[0].entries).toEqual([]);
    });

    it("returns empty array when no snapshots exist", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "u1" } as never);
      all.mockReturnValue([]);
      const { GET } = await import("./route");
      const res = await GET();
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.snapshots).toEqual([]);
    });

    it("only returns snapshots for authenticated user", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "authenticated-user" } as never);
      all.mockReturnValue([
        {
          id: "s1",
          user_id: "authenticated-user",
          date: "2026-01-01",
          total_assets: 5000,
          total_liabilities: 1000,
          net_worth: 4000,
          entries_json: "[]",
          created_at: "2026-01-01T00:00:00.000Z",
        },
      ]);
      const { GET } = await import("./route");
      const res = await GET();
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.snapshots).toHaveLength(1);
      expect(body.snapshots[0].id).toBe("s1");
    });
  });

  describe("POST /api/snapshots", () => {
    it("returns 401 for unauthenticated POST", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never);
      const { POST } = await import("./route");
      const req = jsonRequest("http://test/api/snapshots", "POST", {});
      const res = await POST(req as never);
      expect(res.status).toBe(401);
    });

    it("creates new snapshot on POST with 201 status", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "u1" } as never);
      get.mockReturnValue(undefined);
      const { POST } = await import("./route");
      const req = jsonRequest("http://test/api/snapshots", "POST", {
        date: "2026-01-01",
        totalAssets: 100,
        totalLiabilities: 20,
        netWorth: 80,
        entries: [],
      });
      const res = await POST(req as never);
      expect(res.status).toBe(201);
      expect(run).toHaveBeenCalled();
      const body = await res.json();
      expect(body.snapshot.id).toBe("snap-id");
      expect(body.snapshot.date).toBe("2026-01-01");
      expect(body.snapshot.netWorth).toBe(80);
    });

    it("updates existing snapshot when date already exists", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "u1" } as never);
      get.mockReturnValue({ id: "existing-id" });
      const { POST } = await import("./route");
      const req = jsonRequest("http://test/api/snapshots", "POST", {
        date: "2026-01-01",
        totalAssets: 200,
        totalLiabilities: 50,
        netWorth: 150,
        entries: [{ id: "e1", name: "Entry 1" }],
      });
      const res = await POST(req as never);
      expect(res.status).toBe(200);
      expect(run).toHaveBeenCalled();
      const body = await res.json();
      expect(body.snapshot.id).toBe("existing-id");
    });

    it("parses and returns entries in snapshot response", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "u1" } as never);
      get.mockReturnValue(undefined);
      const entries = [
        { statementType: "Savings", category: "asset", closingBalance: 10000, ownershipPercentage: 100 },
      ];
      const { POST } = await import("./route");
      const req = jsonRequest("http://test/api/snapshots", "POST", {
        date: "2026-01-01",
        totalAssets: 10000,
        totalLiabilities: 0,
        netWorth: 10000,
        entries,
      });
      const res = await POST(req as never);
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.snapshot.entries).toEqual(entries);
    });

    it("creates snapshot with entries", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "u1" } as never);
      get.mockReturnValue(undefined);
      const entries = [
        {
          statementType: "Savings",
          description: "Bank Account",
          category: "asset",
          closingBalance: 50000,
          ownershipPercentage: 100,
        },
      ];
      const { POST } = await import("./route");
      const req = jsonRequest("http://test/api/snapshots", "POST", {
        date: "2026-06-01",
        totalAssets: 50000,
        totalLiabilities: 0,
        netWorth: 50000,
        entries,
      });
      const res = await POST(req as never);
      expect(res.status).toBe(201);
      expect(run).toHaveBeenCalledTimes(1);
    });
  });
});
