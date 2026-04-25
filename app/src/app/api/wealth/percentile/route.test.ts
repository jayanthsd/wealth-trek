// @vitest-environment node

const mockGetAuthenticatedClient = vi.fn();
const mockGetWealthPercentileResult = vi.fn();

vi.mock("@/lib/db", () => ({
  getAuthenticatedClient: (...args: unknown[]) => mockGetAuthenticatedClient(...args),
}));

vi.mock("@/lib/wealthPercentile", () => ({
  getWealthPercentileResult: (...args: unknown[]) => mockGetWealthPercentileResult(...args),
}));

function mockSupabase() {
  const chain: Record<string, any> = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(),
  };
  return { from: vi.fn(() => chain), _chain: chain };
}

describe("/api/wealth/percentile route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetAuthenticatedClient.mockResolvedValue({ userId: null, supabase: null });
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns NO_STATEMENTS error when no snapshot exists", async () => {
    const sb = mockSupabase();
    sb._chain.single.mockResolvedValue({ data: null, error: { message: "not found" } });
    mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
    const { GET } = await import("./route");
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.error).toBe("NO_STATEMENTS");
  });

  it("returns percentile result for existing snapshot", async () => {
    const sb = mockSupabase();
    sb._chain.single.mockResolvedValue({
      data: { net_worth: 2000000, date: "2026-04-01" },
      error: null,
    });
    mockGetWealthPercentileResult.mockReturnValue({
      percentile: 75,
      stage: "Building",
      milestone: "₹30L milestone",
      progress: 66.7,
      insightMessage: "You're in the top 25%",
    });
    mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
    const { GET } = await import("./route");
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.percentile).toBe(75);
    expect(body.lastUpdated).toBe("2026-04-01");
    expect(mockGetWealthPercentileResult).toHaveBeenCalledWith(2000000);
  });

  it("returns 500 when percentile computation throws", async () => {
    const sb = mockSupabase();
    sb._chain.single.mockResolvedValue({ data: { net_worth: 1000000, date: "2026-01-01" }, error: null });
    mockGetWealthPercentileResult.mockImplementation(() => { throw new Error("computation failed"); });
    mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(500);
  });
});
