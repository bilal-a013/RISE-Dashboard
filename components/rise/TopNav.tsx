"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut, MoonStar, Settings2, SunMedium } from "lucide-react";
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
  const displayName = user?.user_metadata?.full_name || user?.email || "RISE Tutor";

  return (
    <header className="rise-nav sticky top-0 z-40 backdrop-blur transition-colors print:hidden">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link href="/dashboard" className="bg-[linear-gradient(135deg,var(--rise-purple)_0%,var(--rise-purple-2)_100%)] bg-clip-text text-2xl font-extrabold text-transparent">
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
        <div className="flex items-center gap-4">
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
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--rise-border)] bg-[var(--rise-surface-soft)] text-sm font-bold text-[var(--rise-purple)] dark:bg-slate-800 dark:text-[var(--rise-purple)]">
            {initialsFromName(displayName)}
          </div>
          <button type="button" onClick={signOut} className="rounded-full p-2 text-[var(--rise-text-muted)] transition hover:bg-[var(--rise-surface-soft)] dark:hover:bg-slate-800" aria-label="Log out">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
