import { getDailyEntry } from "@/actions/daily-entry.actions";
import { getVendorsByGroup, getVendorAmountSuggestions } from "@/actions/vendor.actions";
import { DailyEntryForm } from "./DailyEntryForm";

export default async function DailyEntryPage({ params }: { params: { date: string } }) {
  const [entry, vendorGroups, suggestions] = await Promise.all([
    getDailyEntry(params.date),
    getVendorsByGroup(),
    getVendorAmountSuggestions(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink-900">Daily Entry — {params.date}</h1>
      <DailyEntryForm
        date={params.date}
        existingEntry={entry}
        vendorGroups={vendorGroups}
        suggestions={suggestions}
      />
    </div>
  );
}