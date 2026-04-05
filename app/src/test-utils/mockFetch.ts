import { vi } from "vitest";

export function mockJsonResponse(data: unknown, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    json: async () => data,
  });
}

export function setMockFetch(
  impl: (input: RequestInfo | URL, init?: RequestInit) => Promise<unknown>
) {
  vi.stubGlobal("fetch", vi.fn(impl));
}
