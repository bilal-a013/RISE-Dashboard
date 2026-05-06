import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-[var(--rise-border)] bg-[var(--rise-surface-soft)] print:hidden">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-semibold text-[var(--rise-text)]">RISE Tutoring</p>
          <p className="mt-1 text-sm text-[var(--rise-text-muted)]">© 2026 RISE Tutoring. All rights reserved.</p>
        </div>
        <nav className="flex flex-wrap gap-5 text-sm font-medium text-[var(--rise-text-muted)]">
          {["Help Center", "Support", "Privacy Policy", "Terms of Service"].map((item) => (
            <Link key={item} href="#" className="underline underline-offset-4 hover:text-[var(--rise-purple)]">
              {item}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
