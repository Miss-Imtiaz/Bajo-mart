import ExcelJS from "exceljs";

const GROUP_LABELS: Record<string, string> = {
  OPERATING: "Operating Expenses",
  WHOLESALE: "Wholesale Expenses",
  SNACKS_BEVERAGE: "Snacks / Beverage",
};

export interface ReportExportData {
  title: string; // e.g. "April 2026" or "2026 Yearly Report"
  totals: {
    gasSale: { toString(): string };
    totalCard: { toString(): string };
    lottoTotal: { toString(): string };
    lottoCommission: { toString(): string };
    storeSale: { toString(): string };
    storeTax: { toString(): string };
    payCreditCard: { toString(): string };
    payCashInHand: { toString(): string };
    totalBankExpense: { toString(): string };
    totalCashExpense: { toString(): string };
    totalExpense: { toString(): string };
  };
  vendorRows: {
    name: string;
    group: string;
    bank: { toString(): string };
    cash: { toString(): string };
    total: { toString(): string };
  }[];
}

export async function buildReportWorkbook(data: ReportExportData): Promise<ExcelJS.Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Bajo Mart App";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Report");
  sheet.properties.defaultColWidth = 18;

  // Title
  sheet.mergeCells("A1:E1");
  sheet.getCell("A1").value = `Bajo Mart Inc. — ${data.title}`;
  sheet.getCell("A1").font = { bold: true, size: 16, name: "Arial" };

  let row = 3;

  // Section totals
  sheet.getCell(`A${row}`).value = "Section Totals";
  sheet.getCell(`A${row}`).font = { bold: true, size: 13, name: "Arial" };
  row += 1;

  const sectionRows: [string, string][] = [
    ["Gas Sale", data.totals.gasSale.toString()],
    ["Total Card", data.totals.totalCard.toString()],
    ["Lotto Total", data.totals.lottoTotal.toString()],
    ["Lotto Commission", data.totals.lottoCommission.toString()],
    ["Store Sale", data.totals.storeSale.toString()],
    ["Store Tax", data.totals.storeTax.toString()],
    ["Credit Card", data.totals.payCreditCard.toString()],
    ["Cash In Hand", data.totals.payCashInHand.toString()],
  ];
  for (const [label, value] of sectionRows) {
    sheet.getCell(`A${row}`).value = label;
    sheet.getCell(`A${row}`).font = { name: "Arial" };
    sheet.getCell(`B${row}`).value = Number(value);
    sheet.getCell(`B${row}`).numFmt = "$#,##0.00";
    sheet.getCell(`B${row}`).font = { name: "Arial" };
    row += 1;
  }

  row += 1;

  // Vendor expenses table
  sheet.getCell(`A${row}`).value = "Vendor Expenses";
  sheet.getCell(`A${row}`).font = { bold: true, size: 13, name: "Arial" };
  row += 1;

  const headerRow = row;
  ["Vendor", "Group", "Bank", "Cash", "Total"].forEach((h, i) => {
    const cell = sheet.getCell(row, i + 1);
    cell.value = h;
    cell.font = { bold: true, name: "Arial" };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF6F5F1" } };
  });
  row += 1;

  for (const v of data.vendorRows.sort((a, b) => Number(b.total.toString()) - Number(a.total.toString()))) {
    sheet.getCell(row, 1).value = v.name;
    sheet.getCell(row, 2).value = GROUP_LABELS[v.group] ?? v.group;
    sheet.getCell(row, 3).value = Number(v.bank.toString());
    sheet.getCell(row, 3).numFmt = "$#,##0.00";
    sheet.getCell(row, 4).value = Number(v.cash.toString());
    sheet.getCell(row, 4).numFmt = "$#,##0.00";
    sheet.getCell(row, 5).value = Number(v.total.toString());
    sheet.getCell(row, 5).numFmt = "$#,##0.00";
    for (let c = 1; c <= 5; c++) sheet.getCell(row, c).font = { name: "Arial" };
    row += 1;
  }

  row += 1;

  // Summary
  sheet.getCell(`A${row}`).value = "Expense & Net Summary";
  sheet.getCell(`A${row}`).font = { bold: true, size: 13, name: "Arial" };
  row += 1;

  const summaryRows: [string, string][] = [
    ["Total Bank Expense", data.totals.totalBankExpense.toString()],
    ["Total Cash Expense", data.totals.totalCashExpense.toString()],
    ["Total Expense", data.totals.totalExpense.toString()],
  ];
  for (const [label, value] of summaryRows) {
    sheet.getCell(`A${row}`).value = label;
    sheet.getCell(`A${row}`).font = { bold: true, name: "Arial" };
    sheet.getCell(`B${row}`).value = Number(value);
    sheet.getCell(`B${row}`).numFmt = "$#,##0.00";
    sheet.getCell(`B${row}`).font = { bold: true, name: "Arial" };
    row += 1;
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}
