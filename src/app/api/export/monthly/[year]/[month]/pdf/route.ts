import { NextResponse } from "next/server";
import { getMonthlyReport } from "@/actions/report.actions";
import { buildReportPdf } from "@/lib/exports/pdf";

export const runtime = "nodejs";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export async function GET(
  _req: Request,
  { params }: { params: { year: string; month: string } }
) {
  const year = parseInt(params.year, 10);
  const month = parseInt(params.month, 10);

  try {
    const report = await getMonthlyReport(year, month);

    const buffer = await buildReportPdf({
      title: `${MONTH_NAMES[month - 1]} ${year}`,
      totals: report.totals,
      vendorRows: report.vendorRows,
    });

    // Convert Node.js Buffer to Uint8Array for NextResponse.
    const pdfBytes = new Uint8Array(buffer);

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Bajo-Mart-${MONTH_NAMES[month - 1]}-${year}.pdf"`,
      },
    });
  } catch (e) {
    console.error(e);

    return NextResponse.json(
      { error: "Export failed. Please try again." },
      { status: 500 }
    );
  }
}