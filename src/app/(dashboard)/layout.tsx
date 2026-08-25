import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";
import { NavLinks } from "@/components/NavLinks";
import { MobileNav } from "@/components/MobileNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-paper-100">
      <header className="sticky top-0 z-40 border-b border-line-200 bg-paper-0 px-4 py-3">
        <div className="relative mx-auto flex max-w-content items-center justify-between">
          <span className="text-lg font-semibold text-ink-900">Bajo Mart</span>

          {/* Desktop/tablet nav — hidden below the tablet breakpoint */}
          <nav className="hidden items-center gap-4 text-sm tablet:flex">
            <NavLinks />
            <LogoutButton />
          </nav>

          {/* Mobile hamburger menu — only rendered below the tablet breakpoint */}
          <MobileNav />
        </div>
      </header>
      <main className="mx-auto max-w-content px-4 py-4">{children}</main>
    </div>
  );
}
