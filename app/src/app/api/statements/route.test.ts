// @vitest-environment node
import { jsonRequest } from "@/test-utils/apiTestHelpers";

const mockGetAuthenticatedClient = vi.fn();

vi.mock("@/lib/db", () => ({
  getAuthenticatedClient: (...args: unknown[]) => mockGetAuthenticatedClient(...args),
}));

vi.mock("uuid", () => ({
  v4: vi.fn(() => "generated-id"),
}));

function mockSupabase(overrides: Record<string, unknown> = {}) {
  const chain: Record<string, unknown> = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    ...overrides,
  };
  return { from: vi.fn(() => chain), _chain: chain };
}

describe("/api/statements route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 for unauthenticated GET", async () => {
    mockGetAuthenticatedClient.mockResolvedValue({ userId: null, supabase: null });
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns mapped statements for authenticated GET", async () => {
    const sb = mockSupabase();
    (sb._chain as any).order = vi.fn().mockResolvedValue({
      data: [
        {
          id: "s1",
          statement_type: "Savings",
          description: "A",
          category: "asset",
          closing_balance: 100,
          ownership_percentage: 100,
          source_document_id: null,
        },
      ],
      error: null,
    });
    mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
    const { GET } = await import("./route");
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect((body.statements as Array<Record<string, unknown>>)[0].statementType).toBe("Savings");
  });

  it("creates statement on authenticated POST", async () => {
    const sb = mockSupabase();
    (sb._chain as any).select = vi.fn().mockResolvedValue({
      data: [
        {
          id: "generated-id",
          statement_type: "Savings",
          description: "desc",
          category: "asset",
          closing_balance: 1000,
          ownership_percentage: 100,
          source_document_id: null,
        },
      ],
      error: null,
    });
    mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
    const { POST } = await import("./route");
    const req = jsonRequest("http://test/api/statements", "POST", {
      statementType: "Savings",
      description: "desc",
      category: "asset",
      closingBalance: 1000,
      ownershipPercentage: 100,
    });
    const res = await POST(req as never);
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(Array.isArray(body.statements)).toBe(true);
  });
});
