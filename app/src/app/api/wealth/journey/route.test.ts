// @vitest-environment node
import { jsonRequest } from "@/test-utils/apiTestHelpers";

const mockGetAuthenticatedClient = vi.fn();
const mockComputeAllInsights = vi.fn();
const mockParseBalanceSheet = vi.fn();
const mockClassifyWealthStage = vi.fn();
const mockDetectStageTransition = vi.fn();
const mockComputeStageProgress = vi.fn();
const mockEvaluateChecklist = vi.fn();
const mockComputeStageScore = vi.fn();
const mockComputeStageHistory = vi.fn();

vi.mock("@/lib/db", () => ({
  getAuthenticatedClient: (...args: unknown[]) => mockGetAuthenticatedClient(...args),
}));
vi.mock("@/lib/insightsEngine", () => ({
  computeAllInsights: (...args: unknown[]) => mockComputeAllInsights(...args),
}));
vi.mock("@/lib/balanceSheet", () => ({
  parseBalanceSheet: (...args: unknown[]) => mockParseBalanceSheet(...args),
}));
vi.mock("@/lib/wealthStage", () => ({
  classifyWealthStage: (...args: unknown[]) => mockClassifyWealthStage(...args),
  detectStageTransition: (...args: unknown[]) => mockDetectStageTransition(...args),
  computeStageProgress: (...args: unknown[]) => mockComputeStageProgress(...args),
}));
vi.mock("@/lib/wealthChecklist", () => ({
  evaluateChecklist: (...args: unknown[]) => mockEvaluateChecklist(...args),
  computeStageScore: (...args: unknown[]) => mockComputeStageScore(...args),
  computeStageHistory: (...args: unknown[]) => mockComputeStageHistory(...args),
}));

function mockSupabase(snapshots: unknown[] = []) {
  const chain: Record<string, any> = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: snapshots, error: null }),
  };
  return { from: vi.fn(() => chain), _chain: chain };
}

const STAGE = { id: "building", label: "Building Wealth", scoreLabel: "Good" };
const SNAPSHOT_ROW = {
  id: "s1",
  date: "2026-01-01",
  total_assets: 1000000,
  total_liabilities: 200000,
  net_worth: 800000,
  entries_json: JSON.stringify([]),
  created_at: "2026-01-01T00:00:00Z",
};

describe("/api/wealth/journey route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClassifyWealthStage.mockReturnValue(STAGE);
    mockComputeStageProgress.mockReturnValue(45);
    mockDetectStageTransition.mockReturnValue({ transitioned: false, previousStage: undefined });
    mockComputeAllInsights.mockReturnValue({});
    mockParseBalanceSheet.mockReturnValue({ assets: {}, liabilities: {}, total_assets: 0, total_liabilities: 0 });
    mockEvaluateChecklist.mockReturnValue([]);
    mockComputeStageScore.mockReturnValue({ value: 70, insufficientData: false });
    mockComputeStageHistory.mockReturnValue([]);
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetAuthenticatedClient.mockResolvedValue({ userId: null, supabase: null });
    const { POST } = await import("./route");
    const req = jsonRequest("http://test/api/wealth/journey", "POST", {});
    const res = await POST(req as never);
    expect(res.status).toBe(401);
  });

  it("returns empty result when no snapshots exist", async () => {
    const sb = mockSupabase([]);
    mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
    const { POST } = await import("./route");
    const req = jsonRequest("http://test/api/wealth/journey", "POST", {});
    const res = await POST(req as never);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.stage).toBeNull();
    expect(body.checklist).toEqual([]);
    expect(body.score.insufficientData).toBe(true);
  });

  it("returns journey result for a single snapshot", async () => {
    const sb = mockSupabase([SNAPSHOT_ROW]);
    mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
    const { POST } = await import("./route");
    const req = jsonRequest("http://test/api/wealth/journey", "POST", {});
    const res = await POST(req as never);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.stage).toEqual(STAGE);
    expect(body.progress).toBe(45);
    expect(body.transitioned).toBe(false);
  });

  it("detects stage transition when two snapshots exist", async () => {
    const prev = { ...SNAPSHOT_ROW, id: "s0", date: "2025-12-01", net_worth: 500000 };
    const sb = mockSupabase([prev, SNAPSHOT_ROW]);
    mockDetectStageTransition.mockReturnValue({ transitioned: true, previousStage: { id: "starting", label: "Starting Out" } });
    mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
    const { POST } = await import("./route");
    const req = jsonRequest("http://test/api/wealth/journey", "POST", {});
    const res = await POST(req as never);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.transitioned).toBe(true);
    expect(body.previousStage.id).toBe("starting");
  });

  it("forwards advancedInputs from request body to computeAllInsights", async () => {
    const sb = mockSupabase([SNAPSHOT_ROW]);
    mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
    const { POST } = await import("./route");
    const req = jsonRequest("http://test/api/wealth/journey", "POST", {
      advancedInputs: { monthly_income: 100000, current_age: 32 },
    });
    await POST(req as never);
    const callArgs = mockComputeAllInsights.mock.calls[0];
    expect(callArgs[2]).toMatchObject({ monthly_income: 100000, current_age: 32 });
  });

  it("returns 500 on DB error", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: { message: "DB error" } }),
    };
    const sb = { from: vi.fn(() => chain) };
    mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
    const { POST } = await import("./route");
    const req = jsonRequest("http://test/api/wealth/journey", "POST", {});
    const res = await POST(req as never);
    expect(res.status).toBe(500);
  });
});
