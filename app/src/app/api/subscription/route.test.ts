// @vitest-environment node
import { auth } from "@clerk/nextjs/server";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

const get = vi.fn();
const prepare = vi.fn(() => ({ get }));

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(() => ({ prepare })),
}));

describe("/api/subscription route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 for unauthenticated request", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never);
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns null subscription when no active row", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "u1" } as never);
    get.mockReturnValue(undefined);
    const { GET } = await import("./route");
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.subscription).toBeNull();
  });
});
