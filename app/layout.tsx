import type { Metadata } from "next";
import { mono } from "./fonts/mono";
import { InlineScript } from "./components/InlineScript";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Jenil HT — Product & Visual Designer",
    template: "%s — Jenil HT",
  },
  description:
    "Jenil HT is a product and visual designer in Surat who cares about how things look, feel, and behave, and keeps them clean and functional more than loud.",
  authors: [{ name: "Jenil HT" }],
  openGraph: {
    type: "website",
    title: "Jenil HT — Product & Visual Designer",
    description:
      "A product and visual designer in Surat who cares about how things look, feel, and behave.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full ${mono.variable}`}
      // The script below writes data-theme onto this element before React
      // hydrates, so the server markup and the DOM disagree here by design.
      suppressHydrationWarning
    >
      {/* ── Typeface ─────────────────────────────────────────────────────────
       * Inter, served from rsms.me the way the typeface's own site does it.
       * Modern browsers get InterVariable (one file, all weights plus the opsz
       * optical-size axis, so no separate InterDisplay face is needed); the
       * @supports fallback in globals.css covers the rest.
       *
       * The mono alongside it is Commit Mono, self-hosted through next/font and
       * subset to 14KB a weight; app/fonts/mono.ts records why. It rides in as a
       * CSS variable rather than a className because it dresses the metadata
       * layer, not the page — nothing inherits it by default.
       *
       * Note the emitted <head> puts the Turbopack CSS bundle above these — a
       * React hoisting rule we can't opt out of (a `precedence` prop doesn't
       * beat Next's own). Harmless here: inter.css is nothing but @font-face
       * and @font-feature-values, so it never competes in the cascade, and
       * Next auto-emits a preload for it so the fetch still starts early.
       */}
      <head>
        {/* Applies a stored theme override before first paint. Without it the
            page renders the system palette and then flips once React runs,
            which is a full-page colour flash on every load for anyone who has
            chosen a theme. Nothing stored means the palette follows the OS, so
            this does nothing at all for a reader who has never touched the
            switch in the masthead. */}
        <InlineScript
          html={`try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`}
        />
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
