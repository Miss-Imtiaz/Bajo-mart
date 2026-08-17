import { redirect } from "next/navigation";

export default function YearlyReportIndexPage() {
  redirect(`/reports/yearly/${new Date().getFullYear()}`);
}
