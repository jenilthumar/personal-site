import localFont from "next/font/local";

/**
 * Ioskeley Mono — the site's secondary face, for the metadata layer.
 *
 * An Iosevka build cut to Berkeley Mono's proportions (0.6em advance, not
 * Iosevka's default 0.5), under the OFL. See IoskeleyMono-LICENSE.txt, which
 * ships beside the files because the licence requires it.
 *
 * ── Subset ────────────────────────────────────────────────────────────────
 * The shipped faces are 11KB each, down from 307KB. The full build carries
 * 11,656 glyphs — Greek, Cyrillic, box-drawing, terminal icons — and this site
 * sets Latin. Every non-ASCII character in content/, lib/ and app/ was checked
 * against the range below; the only misses are the Devanagari in the Shilp case
 * study (body prose, which stays Inter) and U+23AF in `dateRange`, which isn't
 * in the full build either and already falls back today.
 *
 * Rebuild with fonttools, from WOFF2-Unhinted in IoskeleyMono-Web.zip
 * (github.com/ahatem/IoskeleyMono/releases, v2.0.0):
 *
 *   pyftsubset IoskeleyMono-Regular.woff2 \
 *     --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,\
 * U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2190-2193,U+2212,U+2215,U+2219,\
 * U+FEFF,U+FFFD" \
 *     --layout-features="kern,mark,mkmk,frac,numr,dnom" \
 *     --flavor=woff2 --with-zopfli --output-file=IoskeleyMono-Regular.subset.woff2
 *
 * Dropping every other layout feature is deliberate, not just weight: the full
 * build ships `calt` and `dlig` coding ligatures, and globals.css turns `calt`
 * on at :root for Inter's sake. Left in, `->` in a label would silently set as
 * an arrow. The subset simply doesn't carry them, so the :root rule is inert
 * here and no per-element override is needed.
 *
 * ── size-adjust ───────────────────────────────────────────────────────────
 * Ioskeley's x-height is 0.520em against Inter's 0.546em, so at a shared
 * font-size the mono reads a step small — which is the usual reason mixed
 * pairings look accidental. 105% (the measured 1.0498 ratio, rounded) matches
 * the two x-heights, so `text-sm` means the same thing in either family and the
 * Tailwind size scale keeps working untouched.
 *
 * Two weights only, mirroring the sans: regular for values, medium for labels.
 */
export const mono = localFont({
  src: [
    { path: "./IoskeleyMono-Regular.subset.woff2", weight: "400", style: "normal" },
    { path: "./IoskeleyMono-Medium.subset.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-ioskeley",
  display: "swap",
  declarations: [{ prop: "size-adjust", value: "105%" }],
  // The generated metric-matched fallback only offers Arial or Times — both
  // proportional, so either would reflow badly in the 100ms before the face
  // lands. A real mono stack holds the columns instead.
  adjustFontFallback: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});
