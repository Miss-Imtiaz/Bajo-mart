import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-paper-100">
      <header className="border-b border-line-200 bg-paper-0 px-4 py-4">
        <div className="mx-auto flex max-w-content items-center justify-between">
          <span className="text-lg font-semibold text-ink-900">Bajo Mart</span>
          <nav className="flex items-center gap-4 text-sm text-ink-700">
            <a href="/">Dashboard</a>
            <a href="/daily-entry">Today's Entry</a>
            <a href="/vendors">Vendors</a>
            <a href="/reports/monthly">Reports</a>
            <a href="/settings">Settings</a>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-content px-4 py-8">{children}</main>
    </div>
  );
}
