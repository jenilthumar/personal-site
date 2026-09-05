/**
 * The two things every media block on the site agrees about: how an aspect
 * string becomes CSS, and what sits in the frame when there's no file yet.
 *
 * Both case-study formats draw media, and both used to carry their own copy of
 * these six lines. That's the kind of duplication this codebase keeps losing
 * arguments to — the placeholder gradient would be tuned in one format and not
 * the other, and the two would quietly stop looking like the same site.
 */

/** "16/9" → "16 / 9", which is what the aspect-ratio property wants. */
export const cssRatio = (aspect = "16/9") => aspect.replace("/", " / ");

/** Stands in for a frame with no file behind it yet. */
export function Placeholder() {
  return (
    <div className="h-full w-full bg-gradient-to-br from-oxley-700/25 via-oxley-700/10 to-transparent" />
  );
}
