// @vitest-environment node
import { DELETE } from "./route";
import { jsonRequest } from "@/test-utils/apiTestHelpers";

describe("/api/documents/[id] route", () => {
  it("returns 400 when storedPath missing", async () => {
    const req = jsonRequest("http://test/api/documents/1", "DELETE", {});
    const res = await DELETE(req as never, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(400);
  });

  it("returns success when request is valid", async () => {
    const req = jsonRequest("http://test/api/documents/1", "DELETE", { storedPath: "a.pdf" });
    const res = await DELETE(req as never, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
  });
});
