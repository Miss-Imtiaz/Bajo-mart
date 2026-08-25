import { NextResponse } from "next/server";
import { getMonthlyReport } from "@/actions/report.actions";
import { buildReportPdf } from "@/lib/exports/pdf";

export const runtime = "nodejs";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export async function GET(_req: Request, { params }: { params: { year: string; month: string } }) {
  const year = parseInt(params.year, 10);
  const month = parseInt(params.month, 10);

  try {
    const report = await getMonthlyReport(year, month);
    const buffer = await buildReportPdf({
      title: `${MONTH_NAMES[month - 1]} ${year}`,
      totals: report.totals,
      vendorRows: report.vendorRows,
    });
return new NextResponse(new Uint8Array(buffer), {
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="Bajo-Mart-Yearly-${year}.pdf"`,
  },
});
   
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Export failed. Please try again." }, { status: 500 });
  }
}
