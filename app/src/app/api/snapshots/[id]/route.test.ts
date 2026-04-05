// @vitest-environment node
import { auth } from "@clerk/nextjs/server";
import { jsonRequest } from "@/test-utils/apiTestHelpers";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

const run = vi.fn();
const prepare = vi.fn(() => ({ run }));

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(() => ({ prepare })),
}));

describe("/api/snapshots/[id] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never);
    const { DELETE } = await import("./route");
    const req = jsonRequest("http://test/api/snapshots/1", "DELETE");
    const res = await DELETE(req as never, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 404 when snapshot missing", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "u1" } as never);
    run.mockReturnValue({ changes: 0 });
    const { DELETE } = await import("./route");
    const req = jsonRequest("http://test/api/snapshots/1", "DELETE");
    const res = await DELETE(req as never, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(404);
  });
});
