// @vitest-environment node
import { auth } from "@clerk/nextjs/server";
import { jsonRequest } from "@/test-utils/apiTestHelpers";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

const get = vi.fn();
const run = vi.fn();
const prepare = vi.fn((sql: string) => {
  if (sql.includes("SELECT * FROM statements WHERE id")) return { get };
  return { run, get };
});

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(() => ({ prepare })),
}));

describe("/api/statements/[id] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 for unauthenticated PUT", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as never);
    const { PUT } = await import("./route");
    const req = jsonRequest("http://test/api/statements/1", "PUT", {});
    const res = await PUT(req as never, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 404 when statement missing on PUT", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "u1" } as never);
    get.mockReturnValueOnce(undefined);
    const { PUT } = await import("./route");
    const req = jsonRequest("http://test/api/statements/1", "PUT", { description: "x" });
    const res = await PUT(req as never, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(404);
  });

  it("deletes existing statement", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "u1" } as never);
    run.mockReturnValueOnce({ changes: 1 });
    const { DELETE } = await import("./route");
    const req = jsonRequest("http://test/api/statements/1", "DELETE");
    const res = await DELETE(req as never, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
  });
});
