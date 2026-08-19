import type { ReactNode } from "react";

/**
 * The two prose columns the design sets running text in: 640px each with a
 * 96px gutter, which lands at about 80 characters a line.
 *
 * They only split once there's room for that measure. Two columns at `md`
 * would be 300px each, seventeen characters wide, so the split waits for `lg`.
 * Stacked, a single column holds roughly the same measure instead of running
 * the full width of the frame.
 *
 * Past the 1440 the design is drawn at, the columns hold their 640 measure and
 * the gutter between them opens instead. Capping the grid at 1376 was the
 * first attempt: the column stopped 72px short of a photograph that ran the
 * full width, and two right edges that nearly line up read worse than two that
 * plainly don't. Widening the columns instead would buy a 110-character line
 * at 1920, which is the one thing the measure exists to prevent.
 *
 * At exactly 1440 this is still the design: 640, a 96px gutter, 640.
 *
 * Shared because the geometry is a design decision, not a per-page one — the
 * columns on About and Running have to line up with each other.
 */
export function ProseColumns({ children }: { children: ReactNode }) {
  return (
    <div className="grid max-w-[42rem] gap-8 text-[18px] leading-[1.4] tracking-[-0.16px] text-on-surface lg:max-w-none lg:grid-cols-[repeat(2,minmax(0,40rem))] lg:justify-between lg:gap-24">
      {children}
    </div>
  );
}
