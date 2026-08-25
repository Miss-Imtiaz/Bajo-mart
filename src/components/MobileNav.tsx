"use client";

import { useState } from "react";
import { NavLinks } from "./NavLinks";
import { LogoutButton } from "./LogoutButton";

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// The full nav menu, shown as a hamburger-triggered dropdown below the
// "tablet" breakpoint. Above that breakpoint the desktop nav in the layout
// takes over instead (this component renders nothing there).
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="tablet:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex items-center justify-center p-2 text-ink-700"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 flex flex-col gap-4 border-b border-line-200 bg-paper-0 px-4 py-4 text-sm shadow-lg">
          <NavLinks onNavigate={() => setOpen(false)} />
          <LogoutButton />
        </div>
      )}
    </div>
  );
}
