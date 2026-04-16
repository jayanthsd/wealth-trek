// @vitest-environment node
import { jsonRequest } from "@/test-utils/apiTestHelpers";

const mockGetAuthenticatedClient = vi.fn();

vi.mock("@/lib/db", () => ({
  getAuthenticatedClient: (...args: unknown[]) => mockGetAuthenticatedClient(...args),
}));

function mockSupabase() {
  const chain: Record<string, any> = {
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  };
  return { from: vi.fn(() => chain), _chain: chain };
}

describe("/api/statements/[id] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 for unauthenticated PUT", async () => {
    mockGetAuthenticatedClient.mockResolvedValue({ userId: null, supabase: null });
    const { PUT } = await import("./route");
    const req = jsonRequest("http://test/api/statements/1", "PUT", {});
    const res = await PUT(req as never, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 404 when statement missing on PUT", async () => {
    const sb = mockSupabase();
    sb._chain.single = vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } });
    mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
    const { PUT } = await import("./route");
    const req = jsonRequest("http://test/api/statements/1", "PUT", { description: "x" });
    const res = await PUT(req as never, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(404);
  });

  it("deletes existing statement", async () => {
    const eqFinal = vi.fn().mockResolvedValue({ error: null, count: 1 });
    const eqFirst = vi.fn().mockReturnValue({ eq: eqFinal });
    const deleteFn = vi.fn().mockReturnValue({ eq: eqFirst });
    const sb = { from: vi.fn(() => ({ delete: deleteFn })) };
    mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
    const { DELETE } = await import("./route");
    const req = jsonRequest("http://test/api/statements/1", "DELETE");
    const res = await DELETE(req as never, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
  });
});
