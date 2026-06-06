import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
