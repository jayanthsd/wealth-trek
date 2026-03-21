export type Category = "asset" | "liability";

export interface StatementEntry {
  id: string;
  statementType: string;
  description: string;
  category: Category;
  closingBalance: number;
  ownershipPercentage: number;
  sourceDocumentId?: string;
}

export interface UserProfile {
  fullName: string;
  address: string;
  certificateDate: string;
  asOnDate: string;
}

export interface StatementTypePreset {
  label: string;
  category: Category;
}

export interface UploadedDocument {
  id: string;
  originalName: string;
  storedPath: string;
  fileType: string;
  size: number;
  uploadedAt: string;
}

export interface ExtractedEntry {
  statementType: string;
  description: string;
  category: Category;
  closingBalance: number;
}

export const STATEMENT_TYPE_PRESETS: StatementTypePreset[] = [
  { label: "Savings Bank Account", category: "asset" },
  { label: "Fixed Deposit", category: "asset" },
  { label: "PPF", category: "asset" },
  { label: "Mutual Fund", category: "asset" },
  { label: "Stock Holdings", category: "asset" },
  { label: "Real Estate", category: "asset" },
  { label: "Gold/Jewellery", category: "asset" },
  { label: "Other Asset", category: "asset" },
  { label: "Home Loan", category: "liability" },
  { label: "Personal Loan", category: "liability" },
  { label: "Car Loan", category: "liability" },
  { label: "Credit Card Outstanding", category: "liability" },
  { label: "Education Loan", category: "liability" },
  { label: "Other Liability", category: "liability" },
];
