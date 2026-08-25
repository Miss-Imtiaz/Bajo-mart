import { NextResponse } from "next/server";
import { getMonthlyReport } from "@/actions/report.actions";
import { buildReportWorkbook } from "@/lib/exports/excel";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export async function GET(_req: Request, { params }: { params: { year: string; month: string } }) {
  const year = parseInt(params.year, 10);
  const month = parseInt(params.month, 10);

  try {
    const report = await getMonthlyReport(year, month);
    const buffer = await buildReportWorkbook({
      title: `${MONTH_NAMES[month - 1]} ${year}`,
      totals: report.totals,
      vendorRows: report.vendorRows,
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Bajo-Mart-${MONTH_NAMES[month - 1]}-${year}.xlsx"`,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Export failed. Please try again." }, { status: 500 });
  }
}
