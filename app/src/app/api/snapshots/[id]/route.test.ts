// @vitest-environment node
import { auth } from "@clerk/nextjs/server";
import { jsonRequest } from "@/test-utils/apiTestHelpers";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

const run = vi.fn();
const prepare = vi.fn((sql: string) => {
  if (sql.includes("DELETE")) return { run };
  return { run };
});

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(() => ({ prepare })),
}));

describe("/api/snapshots/[id] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns 401 for unauthenticated request", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never);
    const { DELETE } = await import("./route");
    const req = jsonRequest("http://test/api/snapshots/123", "DELETE");
    const res = await DELETE(req as never, { params: Promise.resolve({ id: "123" }) });
    expect(res.status).toBe(401);
  });

  it("returns 404 when snapshot not found", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "u1" } as never);
    run.mockReturnValue({ changes: 0 });
    const { DELETE } = await import("./route");
    const req = jsonRequest("http://test/api/snapshots/nonexistent", "DELETE");
    const res = await DELETE(req as never, { params: Promise.resolve({ id: "nonexistent" }) });
    expect(res.status).toBe(404);
  });

  it("deletes snapshot successfully", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "u1" } as never);
    run.mockReturnValue({ changes: 1 });
    const { DELETE } = await import("./route");
    const req = jsonRequest("http://test/api/snapshots/snap-123", "DELETE");
    const res = await DELETE(req as never, { params: Promise.resolve({ id: "snap-123" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(run).toHaveBeenCalledWith("snap-123", "u1");
  });

  it("only deletes snapshot belonging to authenticated user", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "u1" } as never);
    run.mockReturnValue({ changes: 0 }); // No changes if user doesn't own it
    const { DELETE } = await import("./route");
    const req = jsonRequest("http://test/api/snapshots/other-snap", "DELETE");
    const res = await DELETE(req as never, { params: Promise.resolve({ id: "other-snap" }) });
    expect(res.status).toBe(404);
  });
});