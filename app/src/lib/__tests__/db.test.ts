// @vitest-environment node
const mkdirSync = vi.fn();
const existsSync = vi.fn(() => false);
const pragma = vi.fn();
const exec = vi.fn();
const DatabaseMock = vi.fn(function Database() {
  return {
    pragma,
    exec,
  };
});

vi.mock("fs", () => ({
  default: {
    existsSync,
    mkdirSync,
  },
}));

vi.mock("path", async () => {
  const actual = await vi.importActual<typeof import("path")>("path");
  return {
    default: actual,
  };
});

vi.mock("better-sqlite3", () => ({
  default: DatabaseMock,
}));

describe("db", () => {
  it("initializes database once and reuses singleton", async () => {
    vi.resetModules();
    const { getDb } = await import("@/lib/db");
    const db1 = getDb();
    const db2 = getDb();

    expect(db1).toBe(db2);
    expect(DatabaseMock).toHaveBeenCalledTimes(1);
    expect(mkdirSync).toHaveBeenCalled();
    expect(exec).toHaveBeenCalled();
  });
});
