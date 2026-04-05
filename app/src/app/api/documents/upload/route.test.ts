// @vitest-environment node
import { POST } from "./route";

describe("/api/documents/upload route", () => {
  it("returns 400 when no files provided", async () => {
    const formData = new FormData();
    const req = new Request("http://test/api/documents/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it("returns 400 for unsupported file type", async () => {
    const formData = new FormData();
    const file = new File(["hello"], "file.txt", { type: "text/plain" });
    formData.append("files", file);

    const req = new Request("http://test/api/documents/upload", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });
});
