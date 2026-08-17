import { redirect } from "next/navigation";

export default function MonthlyReportIndexPage() {
  const now = new Date();
  redirect(`/reports/monthly/${now.getFullYear()}/${now.getMonth() + 1}`);
}
