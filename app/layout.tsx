import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Sidebar } from "./components/Sidebar";

/* ── Typeface ───────────────────────────────────────────────────────────────
 * AUTHENTIC Sans, self-hosted from app/fonts/ (converted otf → woff2).
 * The design uses two of its named weights: 90 (body) and 130 (headings),
 * exposed to CSS as font-weight 400 and 500 respectively. AUTHENTIC Sans is a
 * deliberately minimal font (basic Latin + em dash); symbols it lacks (®, ∙,
 * arrows…) fall through to the `--font-authentic-sans` family's fallbacks in
 * globals.css. Weights 60 and 150 are also in app/fonts/ if ever needed.
 */
const authenticSans = localFont({
  variable: "--font-authentic-sans",
  display: "swap",
  src: [
    { path: "./fonts/authentic-sans-90.woff2", weight: "400", style: "normal" },
    { path: "./fonts/authentic-sans-130.woff2", weight: "500", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: {
    default: "Jenil HT — Product & Visual Designer",
    template: "%s — Jenil HT",
  },
  description:
    "A product/visual designer who cares deeply about creating functional and visually clean, strong digital experiences & products — how they look, feel & behave.",
  authors: [{ name: "Jenil HT" }],
  openGraph: {
    type: "website",
    title: "Jenil HT — Product & Visual Designer",
    description:
      "A product/visual designer crafting functional, visually clean digital experiences & products.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${authenticSans.variable} h-full`}>
      <body className="min-h-screen">
        {/* Fluid 24px gutters: exactly the Figma at 1440px (336 + 96 + 960),
            then the main column grows to fill, capped at 1920px on very wide
            screens so the layout never strands large side margins. */}
        <div className="mx-auto flex min-h-screen max-w-[1920px] flex-col gap-12 px-6 py-6 lg:flex-row lg:gap-24">
          <Sidebar />
          <main className="min-w-0 flex-1 lg:pt-[52px]">{children}</main>
        </div>
      </body>
    </html>
  );
}
