/**
 * The three vector marks in the Figma nav, kept as the exact exported paths.
 * All of them are drawn on a coarse pixel grid to sit with the raster nav
 * icons, so they're inlined rather than redrawn as smooth shapes — the
 * staircase edges are the point. Each inherits `currentColor`.
 */

/** Pixel triangle bulleting each item under a folder. 6 × 10 in the design. */
export function BulletMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 6 10"
      fill="none"
      aria-hidden="true"
      className={`h-[10px] w-[6px] shrink-0 ${className}`}
    >
      <path d="M0 10H2V8H4V6H6V4H4V2H2V0H0V10Z" fill="currentColor" />
    </svg>
  );
}

/** Pixel chevron after "View project". Drawn 7.33 × 12.83, shown 6 × 10.5. */
export function ChevronMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 7.33333 12.8333"
      fill="none"
      aria-hidden="true"
      className={`h-[10.5px] w-[6px] shrink-0 ${className}`}
    >
      <path
        d="M7.33333 7.33333V5.5H5.5V7.33333H7.33333ZM5.5 5.5V3.66667H3.66667V5.5H5.5ZM5.5 9.16667V7.33333H3.66667V9.16667H5.5ZM3.66667 3.66667V1.83333H1.83333V3.66667H3.66667ZM3.66667 11V9.16667H1.83333V11H3.66667ZM1.83333 1.83333V0H0V1.83333H1.83333ZM1.83333 12.8333V11H0V12.8333H1.83333Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * The four corner ticks around the Contact button. One L-path, flipped into
 * each corner the way the design does it.
 *
 * They live in a box rather than being pinned individually, so a caller can
 * animate that one box's inset and have all four close in together — the
 * reticle move. It sits at 0.49px by default, half the 0.75 stroke, so the
 * stroke falls inside the button's edge instead of straddling it.
 */
const CORNERS = [
  "left-0 top-0",
  "right-0 top-0 -scale-x-100",
  "left-0 bottom-0 -scale-y-100",
  "right-0 bottom-0 rotate-180",
];

export function CornerBrackets({ className = "" }: { className?: string }) {
  return (
    <span className={`pointer-events-none absolute inset-[0.49px] ${className}`}>
      {CORNERS.map((position) => (
        <svg
          key={position}
          viewBox="0 0 8.41078 8.38477"
          fill="none"
          aria-hidden="true"
          className={`absolute h-[8.38px] w-[8.41px] ${position}`}
        >
          <path
            d="M0.375 8.38477V0.375H8.41078"
            stroke="currentColor"
            strokeWidth="0.75"
          />
        </svg>
      ))}
    </span>
  );
}
