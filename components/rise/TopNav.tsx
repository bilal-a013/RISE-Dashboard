"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { mockTutor } from "../../lib/mockRiseData";
import { initialsFromName } from "../../lib/tutorKey";
import { cn } from "./utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/students/new", label: "Students" },
  { href: "/tutor-key", label: "Reports" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[#c7c4d7] bg-white/95 shadow-sm backdrop-blur print:hidden">
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
                    active ? "border-b-2 border-[#4648d4] text-[#4648d4]" : "text-[#464554] hover:text-[#4648d4]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" className="rounded-full p-2 text-[#464554] hover:bg-[#f5f2fe]" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c7c4d7] bg-[#efecf8] text-sm font-bold text-[#4648d4]">
            {initialsFromName(mockTutor.fullName)}
          </div>
        </div>
      </div>
    </header>
  );
}
