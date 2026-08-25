"use client";

import { usePathname } from "next/navigation";
import { createElement } from "react";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/daily-entry", label: "Today's Entry" },
  { href: "/vendors", label: "Vendors" },
  { href: "/reports/monthly", label: "Monthly Report" },
  { href: "/reports/yearly", label: "Yearly Report" },
  { href: "/settings", label: "Settings" },
];

export function NavLinks({ onNavigate }: { onNavigate?: () => void } = {}) {
  const pathname = usePathname();

  return links.map((link) => {
    const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
    return createElement(
      "a",
      {
        key: link.href,
        href: link.href,
        onClick: onNavigate,
        className: isActive ? "font-semibold text-ink-900" : "text-ink-700 hover:text-ink-900",
      },
      link.label
    );
  });
}
