import type { Metadata, Viewport } from "next";
import { Fira_Code, Fira_Sans } from "next/font/google";
import "./globals.css";

// SOURCES:
// - Next.js font optimization: node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md
//   (next/font/google self-hosting, apply in root layout)
// - ui-ux-pro-max design system for "Roobet Tracker": Fira Code / Fira Sans
//   for dashboard/data/analytics; Dark Mode (OLED), WCAG AAA
// - shadcn/ui theming: dark class on root for token switching
//   https://ui.shadcn.com/docs/theming (via Context7)
// - ui-ux-pro-max layout rule: viewport-meta width=device-width initial-scale=1

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Roobet Tracker",
  description: "Private gambling P&L tracker — bookmarklet ingest + monthly ROI dashboard",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`dark ${firaSans.variable} ${firaCode.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
