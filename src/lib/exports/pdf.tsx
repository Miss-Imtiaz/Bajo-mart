import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { ReportExportData } from "./excel";

const GROUP_LABELS: Record<string, string> = {
  OPERATING: "Operating Expenses",
  WHOLESALE: "Wholesale Expenses",
  SNACKS_BEVERAGE: "Snacks / Beverage",
};

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#3A4450", marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: 700, marginTop: 16, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: "#E4E2DB" },
  label: { color: "#3A4450" },
  value: { fontWeight: 700 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#12181F", paddingBottom: 4, marginBottom: 4 },
  tableHeaderCell: { fontWeight: 700, fontSize: 9 },
  tableRow: { flexDirection: "row", paddingVertical: 2, borderBottomWidth: 0.5, borderBottomColor: "#E4E2DB" },
  tableCell: { fontSize: 9 },
  colName: { width: "35%" },
  colGroup: { width: "25%" },
  colAmount: { width: "13%", textAlign: "right" },
});

function ReportDocument({ data }: { data: ReportExportData }) {
  const sortedVendors = [...data.vendorRows].sort(
    (a, b) => Number(b.total.toString()) - Number(a.total.toString())
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Bajo Mart Inc.</Text>
        <Text style={styles.subtitle}>{data.title}</Text>

        <Text style={styles.sectionTitle}>Section Totals</Text>
        {[
          ["Gas Sale", data.totals.gasSale.toString()],
          ["Total Card", data.totals.totalCard.toString()],
          ["Lotto Total", data.totals.lottoTotal.toString()],
          ["Lotto Commission", data.totals.lottoCommission.toString()],
          ["Store Sale", data.totals.storeSale.toString()],
          ["Store Tax", data.totals.storeTax.toString()],
          ["Credit Card", data.totals.payCreditCard.toString()],
          ["Cash In Hand", data.totals.payCashInHand.toString()],
        ].map(([label, value]) => (
          <View style={styles.row} key={label}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>${value}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Vendor Expenses</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.colName]}>Vendor</Text>
          <Text style={[styles.tableHeaderCell, styles.colGroup]}>Group</Text>
          <Text style={[styles.tableHeaderCell, styles.colAmount]}>Bank</Text>
          <Text style={[styles.tableHeaderCell, styles.colAmount]}>Cash</Text>
          <Text style={[styles.tableHeaderCell, styles.colAmount]}>Total</Text>
        </View>
        {sortedVendors.map((v) => (
          <View style={styles.tableRow} key={v.name}>
            <Text style={[styles.tableCell, styles.colName]}>{v.name}</Text>
            <Text style={[styles.tableCell, styles.colGroup]}>{GROUP_LABELS[v.group] ?? v.group}</Text>
            <Text style={[styles.tableCell, styles.colAmount]}>${v.bank.toString()}</Text>
            <Text style={[styles.tableCell, styles.colAmount]}>${v.cash.toString()}</Text>
            <Text style={[styles.tableCell, styles.colAmount]}>${v.total.toString()}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Expense & Net Summary</Text>
        {[
          ["Total Bank Expense", data.totals.totalBankExpense.toString()],
          ["Total Cash Expense", data.totals.totalCashExpense.toString()],
          ["Total Expense", data.totals.totalExpense.toString()],
        ].map(([label, value]) => (
          <View style={styles.row} key={label}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>${value}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function buildReportPdf(data: ReportExportData): Promise<Buffer> {
  return renderToBuffer(<ReportDocument data={data} />);
}
