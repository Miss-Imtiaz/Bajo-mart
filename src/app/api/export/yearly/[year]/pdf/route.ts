import { NextResponse } from "next/server";
import { getYearlyReport } from "@/actions/report.actions";
import { buildReportPdf } from "@/lib/exports/pdf";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { year: string } }) {
  const year = parseInt(params.year, 10);

  try {
    const report = await getYearlyReport(year);
    const buffer = await buildReportPdf({
      title: `${year} Yearly Report`,
      totals: report.totals,
      vendorRows: report.vendorRows,
    });

    return new NextResponse(buffer, {
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
