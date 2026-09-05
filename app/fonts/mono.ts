import localFont from "next/font/local";

/**
 * Commit Mono — the site's secondary face, for the metadata layer.
 *
 * Eigil Nikolajsen's programming typeface, under the OFL. See
 * CommitMono-LICENSE.txt, which ships beside the files because the licence
 * requires it.
 *
 * ── Subset ────────────────────────────────────────────────────────────────
 * The shipped faces are 14KB each, down from 59KB. The full build carries
 * 1,932 glyphs over 1,175 codepoints and this site sets Latin. Every non-ASCII
 * character that reaches the mono is in the range below, down to the U+2219 the
 * tag rows separate with, which Inter doesn't even carry. The Devanagari in the
 * Shilp case study is outside it and stays that way: it's body prose, so it was
 * never this face's to set.
 *
 * Rebuild with fonttools. The release zip only holds the default style group,
 * weights 400 and 700, so 500 isn't in it — take both weights from the
 * per-weight masters instead, which is what the customiser on commitmono.com
 * fetches when you pick a weight (github.com/eigilnikolajsen/commit-mono,
 * v1.143, src/fonts/fontlab/CommitMonoV143-{400,500}Regular.otf; the 400 master
 * is glyph-for-glyph identical to the released 400):
 *
 *   pyftsubset CommitMonoV143-400Regular.otf \
 *     --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,\
 * U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2190-2193,U+2212,U+2215,U+2219,\
 * U+FEFF,U+FFFD" \
 *     --layout-features="kern,mark,mkmk,frac,numr,dnom" \
 *     --flavor=woff2 --with-zopfli --output-file=CommitMono-Regular.subset.woff2
 *
 * Naming the features to keep is deliberate, not just weight. Commit Mono's
 * coding ligatures and alternates sit in ss01–ss05 and cv01–cv11, and the
 * website build copies whichever are switched on into `calt` — the same feature
 * globals.css turns on at :root for Inter's sake. Left in, `->` in a label would
 * silently set as an arrow. The subset carries neither the sets nor a calt, so
 * the :root rule is inert here and no per-element override is needed.
 *
 * ── size-adjust ───────────────────────────────────────────────────────────
 * Commit Mono's x-height is 0.540em against Inter's 0.546em, so at a shared
 * font-size the mono reads a touch small — which is the usual reason mixed
 * pairings look accidental. 101% (the measured 1.0111 ratio, rounded) matches
 * the two x-heights, so `text-sm` means the same thing in either family and the
 * Tailwind size scale keeps working untouched.
 *
 * size-adjust scales the advance along with everything else, and the face is
 * monospaced at a flat 0.6em, so this percentage is also what sets the width of
 * every mono column on the site: 0.606em a character here.
 *
 * Two weights only, mirroring the sans: regular carries the whole metadata
 * layer, and medium is reserved for the FIGURE display numbers.
 */
export const mono = localFont({
  src: [
    { path: "./CommitMono-Regular.subset.woff2", weight: "400", style: "normal" },
    { path: "./CommitMono-Medium.subset.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-commit-mono",
  display: "swap",
  declarations: [{ prop: "size-adjust", value: "101%" }],
  // The generated metric-matched fallback only offers Arial or Times — both
  // proportional, so either would reflow badly in the 100ms before the face
  // lands. A real mono stack holds the columns instead.
  adjustFontFallback: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});
