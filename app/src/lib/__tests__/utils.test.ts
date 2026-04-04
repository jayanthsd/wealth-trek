import { cn } from "@/lib/utils";

describe("utils", () => {
  it("merges class names and tailwind conflicts", () => {
    expect(cn("p-2", "p-4", "text-sm")).toBe("p-4 text-sm");
  });
});
