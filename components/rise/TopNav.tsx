"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, LogOut, MoonStar, Settings2, SunMedium } from "lucide-react";
import { initialsFromName } from "../../lib/tutorKey";
import { useAuth } from "./AuthProvider";
import { useTheme } from "./ThemeProvider";
import { cn } from "./utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/students", label: "Students" },
  { href: "/reports", label: "Reports" },
];

export function TopNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const displayName = user?.user_metadata?.full_name || user?.email || "RISE Tutor";

  useEffect(() => {
    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <header className="rise-nav sticky top-0 z-40 backdrop-blur transition-colors print:hidden">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/dashboard" className="bg-[linear-gradient(135deg,var(--rise-purple)_0%,var(--rise-purple-2)_100%)] bg-clip-text text-xl font-extrabold text-transparent sm:text-2xl">
            RISE Tutoring
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "pb-1 text-sm font-semibold transition",
                    active ? "border-b-2 border-[var(--rise-purple)] text-[var(--rise-purple)] dark:border-[var(--rise-purple)] dark:text-[var(--rise-purple)]" : "text-[var(--rise-text-muted)] hover:text-[var(--rise-purple)] dark:text-[var(--rise-text-muted)] dark:hover:text-[var(--rise-purple)]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/settings/integrations"
              className={cn(
                "flex items-center gap-1 pb-1 text-sm font-semibold transition",
                pathname.startsWith("/settings") ? "border-b-2 border-[var(--rise-purple)] text-[var(--rise-purple)] dark:border-[var(--rise-purple)] dark:text-[var(--rise-purple)]" : "text-[var(--rise-text-muted)] hover:text-[var(--rise-purple)] dark:text-[var(--rise-text-muted)] dark:hover:text-[var(--rise-purple)]"
              )}
            >
              <Settings2 className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button type="button" className="rounded-full p-2 text-[var(--rise-text-muted)] transition hover:bg-[var(--rise-surface-soft)] dark:hover:bg-slate-800" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full p-2 text-[var(--rise-text-muted)] transition hover:bg-[var(--rise-surface-soft)] dark:hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
          </button>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2 rounded-full border border-[var(--rise-border)] bg-[var(--rise-surface)] px-2 py-1.5 text-sm font-semibold text-[var(--rise-text)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--rise-purple)]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--rise-surface-soft)] text-sm font-bold text-[var(--rise-purple)]">
                {initialsFromName(displayName)}
              </span>
              <ChevronDown className="h-4 w-4 text-[var(--rise-text-muted)]" />
            </button>
            {menuOpen ? (
              <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-[var(--rise-border)] bg-[var(--rise-surface)] shadow-xl">
                <div className="border-b border-[var(--rise-border)] px-4 py-3">
                  <p className="font-semibold text-[var(--rise-heading)]">{displayName}</p>
                  <p className="mt-1 truncate text-sm text-[var(--rise-text-muted)]">{user?.email}</p>
                </div>
                <div className="flex flex-col p-2">
                  <Link href="/settings/integrations" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2 text-sm text-[var(--rise-text)] transition hover:bg-[var(--rise-surface-soft)]">
                    Settings / Integrations
                  </Link>
                  <button type="button" onClick={toggleTheme} className="rounded-xl px-3 py-2 text-left text-sm text-[var(--rise-text)] transition hover:bg-[var(--rise-surface-soft)]">
                    Theme: {theme === "dark" ? "Dark" : "Light"}
                  </button>
                  <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2 text-sm text-[var(--rise-text)] transition hover:bg-[var(--rise-surface-soft)]">
                    Account / Profile
                  </Link>
                  <button type="button" onClick={signOut} className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#b3261e] transition hover:bg-[#fff1f0] dark:hover:bg-rose-950/20">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            ) : null}
          </div>
          <button type="button" onClick={signOut} className="rounded-full p-2 text-[var(--rise-text-muted)] transition hover:bg-[var(--rise-surface-soft)] dark:hover:bg-slate-800 sm:hidden" aria-label="Log out">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
