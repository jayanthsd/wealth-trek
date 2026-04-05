import { EXTRACTION_SYSTEM_PROMPT } from "@/lib/extractionPrompt";

describe("extraction prompt", () => {
  it("contains key extraction rules and valid output hint", () => {
    expect(EXTRACTION_SYSTEM_PROMPT).toContain("extract ACCOUNT-LEVEL financial information");
    expect(EXTRACTION_SYSTEM_PROMPT).toContain("Return ONLY a JSON array");
    expect(EXTRACTION_SYSTEM_PROMPT).toContain("\"statementType\"");
    expect(EXTRACTION_SYSTEM_PROMPT).toContain("\"closingBalance\"");
  });
});
