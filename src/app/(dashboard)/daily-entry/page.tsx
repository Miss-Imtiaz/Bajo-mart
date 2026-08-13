import { redirect } from "next/navigation";
import { todayDateString } from "@/lib/dates";

export default function DailyEntryIndexPage() {
  redirect(`/daily-entry/${todayDateString()}`);
}