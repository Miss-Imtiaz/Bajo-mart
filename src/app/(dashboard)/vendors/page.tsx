import { getVendorsByGroup } from "@/actions/vendor.actions";
import { VendorGroupCard } from "./VendorGroupCard";

export default async function VendorsPage() {
  const groups = await getVendorsByGroup();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink-900">Vendors</h1>
      <p className="text-sm text-ink-700">
        Add, rename, or deactivate vendors. Deactivating hides a vendor from new daily
        entries but keeps its history in past reports — vendors are never deleted.
      </p>

      <VendorGroupCard title="Operating Expenses" group="OPERATING" vendors={groups.OPERATING} />
      <VendorGroupCard title="Wholesale Expenses" group="WHOLESALE" vendors={groups.WHOLESALE} />
      <VendorGroupCard
        title="Snacks / Beverage"
        group="SNACKS_BEVERAGE"
        vendors={groups.SNACKS_BEVERAGE}
      />
    </div>
  );
}
