import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { StatementEntry, UserProfile } from "@/types";
import { computeEffectiveValue, computeTotals, formatINR } from "./computations";

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function generateNetWorthPdf(
  profile: UserProfile,
  statements: StatementEntry[]
) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 20;

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("NET WORTH CERTIFICATE", pageWidth / 2, y, { align: "center" });
  y += 12;

  // Underline
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Profile details
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  doc.text(`Name: ${profile.fullName}`, margin, y);
  y += 7;

  if (profile.address) {
    doc.text(`Address: ${profile.address}`, margin, y);
    y += 7;
  }

  doc.text(`Certificate Date: ${formatDate(profile.certificateDate)}`, margin, y);
  y += 7;

  doc.text(`Statement of Net Worth as on: ${formatDate(profile.asOnDate)}`, margin, y);
  y += 12;

  // Assets table
  const assets = statements.filter((s) => s.category === "asset");
  const liabilities = statements.filter((s) => s.category === "liability");
  const totals = computeTotals(statements);

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("A. Assets", margin, y);
  y += 2;

  if (assets.length > 0) {
    const assetRows = assets.map((entry, i) => [
      String(i + 1),
      entry.statementType,
      entry.description || "—",
      formatINR(entry.closingBalance),
      `${entry.ownershipPercentage}%`,
      formatINR(computeEffectiveValue(entry)),
    ]);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["S.No", "Statement Type", "Description", "Closing Balance", "Ownership %", "Effective Value"]],
      body: assetRows,
      foot: [["", "", "", "", "Total Assets", formatINR(totals.totalAssets)]],
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], fontSize: 9, fontStyle: "bold" },
      footStyles: { fillColor: [236, 240, 241], textColor: [0, 0, 0], fontSize: 9, fontStyle: "bold" },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        1: { cellWidth: 35 },
        2: { cellWidth: 40 },
        3: { cellWidth: 35, halign: "right" },
        4: { cellWidth: 22, halign: "center" },
        5: { cellWidth: 35, halign: "right" },
      },
    });

    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  } else {
    y += 4;
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("Nil", margin + 5, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.text(`Total Assets: ${formatINR(0)}`, margin + 5, y);
    y += 10;
  }

  // Liabilities table
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("B. Liabilities", margin, y);
  y += 2;

  if (liabilities.length > 0) {
    const liabilityRows = liabilities.map((entry, i) => [
      String(i + 1),
      entry.statementType,
      entry.description || "—",
      formatINR(entry.closingBalance),
      `${entry.ownershipPercentage}%`,
      formatINR(computeEffectiveValue(entry)),
    ]);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["S.No", "Statement Type", "Description", "Closing Balance", "Ownership %", "Effective Value"]],
      body: liabilityRows,
      foot: [["", "", "", "", "Total Liabilities", formatINR(totals.totalLiabilities)]],
      theme: "grid",
      headStyles: { fillColor: [192, 57, 43], fontSize: 9, fontStyle: "bold" },
      footStyles: { fillColor: [236, 240, 241], textColor: [0, 0, 0], fontSize: 9, fontStyle: "bold" },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        1: { cellWidth: 35 },
        2: { cellWidth: 40 },
        3: { cellWidth: 35, halign: "right" },
        4: { cellWidth: 22, halign: "center" },
        5: { cellWidth: 35, halign: "right" },
      },
    });

    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  } else {
    y += 4;
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("Nil", margin + 5, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.text(`Total Liabilities: ${formatINR(0)}`, margin + 5, y);
    y += 10;
  }

  // Net Worth Summary
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Total Assets:", margin, y);
  doc.text(formatINR(totals.totalAssets), pageWidth - margin, y, { align: "right" });
  y += 7;

  doc.text("Total Liabilities:", margin, y);
  doc.text(formatINR(totals.totalLiabilities), pageWidth - margin, y, { align: "right" });
  y += 3;

  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Net Worth:", margin, y);
  doc.text(formatINR(totals.netWorth), pageWidth - margin, y, { align: "right" });
  y += 3;

  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 15;

  // Signature area
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Signature: ___________________________", pageWidth - margin - 80, y);
  y += 6;
  doc.text(`Name: ${profile.fullName}`, pageWidth - margin - 80, y);

  // Generate filename
  const safeName = profile.fullName.replace(/[^a-zA-Z0-9]/g, "_");
  const safeDate = profile.asOnDate.replace(/-/g, "");
  const filename = `NetWorth_Certificate_${safeName}_${safeDate}.pdf`;

  doc.save(filename);
}
