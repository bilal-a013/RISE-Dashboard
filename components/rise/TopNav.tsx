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
    <header className="sticky top-0 z-40 border-b border-[#c7c4d7] bg-white/95 shadow-sm backdrop-blur transition-colors print:hidden dark:border-slate-700 dark:bg-slate-950/90">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link href="/dashboard" className="bg-[linear-gradient(135deg,#4648d4_0%,#8127cf_100%)] bg-clip-text text-2xl font-extrabold text-transparent">
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
                    active ? "border-b-2 border-[#4648d4] text-[#4648d4] dark:border-[#c0c1ff] dark:text-[#c0c1ff]" : "text-[#464554] hover:text-[#4648d4] dark:text-slate-300 dark:hover:text-[#c0c1ff]"
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
                pathname.startsWith("/settings") ? "border-b-2 border-[#4648d4] text-[#4648d4] dark:border-[#c0c1ff] dark:text-[#c0c1ff]" : "text-[#464554] hover:text-[#4648d4] dark:text-slate-300 dark:hover:text-[#c0c1ff]"
              )}
            >
              <Settings2 className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" className="rounded-full p-2 text-[#464554] transition hover:bg-[#f5f2fe] dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full p-2 text-[#464554] transition hover:bg-[#f5f2fe] dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c7c4d7] bg-[#efecf8] text-sm font-bold text-[#4648d4] dark:border-slate-700 dark:bg-slate-800 dark:text-[#c0c1ff]">
            {initialsFromName(displayName)}
          </div>
          <button type="button" onClick={signOut} className="rounded-full p-2 text-[#464554] transition hover:bg-[#f5f2fe] dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Log out">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
