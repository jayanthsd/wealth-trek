// @vitest-environment node
import { jsonRequest } from "@/test-utils/apiTestHelpers";

const mockGetAuthenticatedClient = vi.fn();

vi.mock("@/lib/db", () => ({
  getAuthenticatedClient: (...args: unknown[]) => mockGetAuthenticatedClient(...args),
}));

vi.mock("uuid", () => ({
  v4: vi.fn(() => "snap-id"),
}));

function mockSupabase() {
  const chain: Record<string, any> = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn(),
  };
  return { from: vi.fn(() => chain), _chain: chain };
}

describe("/api/snapshots route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 for unauthenticated GET", async () => {
    mockGetAuthenticatedClient.mockResolvedValue({ userId: null, supabase: null });
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("creates snapshot on POST", async () => {
    const sb = mockSupabase();
    // single() returns no existing snapshot for this date
    sb._chain.single = vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } });
    // insert chain resolves ok
    sb._chain.insert = vi.fn().mockReturnValue({
      ...sb._chain,
    });
    // Make the final call in the insert path resolve
    const insertChain: Record<string, any> = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
    };
    let callCount = 0;
    sb.from = vi.fn(() => {
      callCount++;
      if (callCount === 1) {
        // First from() call is for checking existing snapshot
        return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } }) }) }) }) };
      }
      // Second from() call is for insert
      return { insert: vi.fn().mockResolvedValue({ error: null }) };
    });
    mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
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
  });
});
