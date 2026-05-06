import "./globals.css";
import type { ReactNode } from "react";
import { AppProviders } from "../components/rise/AppProviders";

export const metadata = {
  title: "RISE Tutoring | Post-Session Tutor Log",
  description: "Generate polished parent reports and structured session payloads for RISE Tutoring.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('rise-dashboard-theme');
                  var system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  var theme = stored === 'dark' || stored === 'light' ? stored : system;
                  if (theme === 'dark') document.documentElement.classList.add('dark');
                  document.documentElement.dataset.theme = theme;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
