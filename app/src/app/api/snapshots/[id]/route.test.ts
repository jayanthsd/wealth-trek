// @vitest-environment node
import { jsonRequest } from "@/test-utils/apiTestHelpers";

const mockGetAuthenticatedClient = vi.fn();

vi.mock("@/lib/db", () => ({
  getAuthenticatedClient: (...args: unknown[]) => mockGetAuthenticatedClient(...args),
}));

function mockSupabase() {
  const chain: Record<string, any> = {
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
  };
  return { from: vi.fn(() => chain), _chain: chain };
}

describe("/api/snapshots/[id] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetAuthenticatedClient.mockResolvedValue({ userId: null, supabase: null });
    const { DELETE } = await import("./route");
    const req = jsonRequest("http://test/api/snapshots/1", "DELETE");
    const res = await DELETE(req as never, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 404 when snapshot missing", async () => {
    const eqFinal = vi.fn().mockResolvedValue({ error: null, count: 0 });
    const eqFirst = vi.fn().mockReturnValue({ eq: eqFinal });
    const deleteFn = vi.fn().mockReturnValue({ eq: eqFirst });
    const sb = { from: vi.fn(() => ({ delete: deleteFn })) };
    mockGetAuthenticatedClient.mockResolvedValue({ userId: "u1", supabase: sb });
    const { DELETE } = await import("./route");
    const req = jsonRequest("http://test/api/snapshots/1", "DELETE");
    const res = await DELETE(req as never, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(404);
  });
});
