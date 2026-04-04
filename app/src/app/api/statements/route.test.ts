// @vitest-environment node
import { auth } from "@clerk/nextjs/server";
import { jsonRequest } from "@/test-utils/apiTestHelpers";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

const all = vi.fn();
const run = vi.fn();
const prepare = vi.fn(() => ({ all, run }));
const transaction = vi.fn((fn: () => void) => fn);

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(() => ({ prepare, transaction })),
}));

vi.mock("uuid", () => ({
  v4: vi.fn(() => "generated-id"),
}));

describe("/api/statements route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 for unauthenticated GET", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never);
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns mapped statements for authenticated GET", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "u1" } as never);
    all.mockReturnValue([
      {
        id: "s1",
        statement_type: "Savings",
        description: "A",
        category: "asset",
        closing_balance: 100,
        ownership_percentage: 100,
        source_document_id: null,
      },
    ]);
    const { GET } = await import("./route");
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect((body.statements as Array<Record<string, unknown>>)[0].statementType).toBe("Savings");
  });

  it("creates statement on authenticated POST", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "u1" } as never);
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
    expect(run).toHaveBeenCalled();
  });
});
