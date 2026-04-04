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
  });

  it("returns 401 for unauthenticated GET", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never);
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("creates snapshot on POST", async () => {
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
  });
});
