import type { UserProfile } from "@/types";

const save = vi.fn();
const text = vi.fn();
const line = vi.fn();
const setFontSize = vi.fn();
const setFont = vi.fn();
const setLineWidth = vi.fn();

vi.mock("jspdf", () => {
  return {
    default: vi.fn(function JsPdf() {
      return {
        internal: { pageSize: { getWidth: () => 210 } },
        setFontSize,
        setFont,
        text,
        setLineWidth,
        line,
        save,
        lastAutoTable: { finalY: 120 },
      };
    }),
  };
});

vi.mock("jspdf-autotable", () => ({
  default: vi.fn(),
}));

describe("generateNetWorthPdf", () => {
  it("builds and saves a PDF", async () => {
    const { generateNetWorthPdf } = await import("@/lib/generatePdf");
    const profile: UserProfile = {
      fullName: "Test User",
      address: "Address",
      certificateDate: "2026-01-01",
      asOnDate: "2026-01-31",
    };

    generateNetWorthPdf(profile, []);
    expect(text).toHaveBeenCalled();
    expect(save).toHaveBeenCalledTimes(1);
  });
});
