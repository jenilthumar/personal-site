import type { ReactNode } from "react";
import { getRunningData, type Month } from "@/lib/running";
import { ProseColumns } from "@/app/components/ProseColumns";
import { Statement } from "@/app/components/Statement";

export const metadata = {
  title: "Am I getting fitter?",
  description:
    "A new running habit, read honestly from a Strava export. Not a dashboard, just a record of finally showing up.",
};

/* ──────────────────────────────────────────────────────────────────────────
   The running log, on the same column and rhythm as home and About: the 1376
   measure, 56px for the opening line, 18px for the reading, and each block
   introduced by the feed's header — title, a bracketed qualifier, and a
   number out on the right where the feed puts its link.

   The blocks take the full content column past 1440, the way the feed's media
   does; the sentences keep their 1376 measure inside it. Capping the whole
   page at 1376 instead was the first attempt, and it read as a bug: with no
   photographs to fill the extra room, every block stopped short of the right
   gutter and the page looked inset against home and About.

   Scoped to this year, the season the running got serious. No heart rate in
   the export, so no faked fitness curve. Data: lib/running.
   ────────────────────────────────────────────────────────────────────────── */

/**
 * Numbers get the one size this page adds: 32px on the 1376 column, built the
 * same way as the 56px statement so the two scale together. It sits between
 * the 18px reading and the statement, which is where a figure that's meant to
 * be read at a glance belongs — 18px is too quiet to carry a page whose whole
 * job is counting, and 56px would put eight of them in a shouting match with
 * the opening line.
 */
const FIGURE =
  "font-mono text-[clamp(1.5rem,2.33vw,2rem)] font-medium leading-none tracking-normal text-on-surface";

/** A single note, held to one column's measure rather than the full width. */
const NOTE = "max-w-[40rem] text-[18px] leading-[1.4] tracking-[-0.16px]";

/**
 * The small print, in the mono. `case` is gone with the swap — it existed to
 * lift Inter's brackets to cap height, and this font carries no such feature
 * and needs none. So is `tabular-nums` wherever these land: every figure in
 * this face is the same width by construction.
 */
const LABEL = "font-mono tracking-normal";

/**
 * The bracketed qualifier beside a section title. A step below the header's
 * 18px, because mono set at the row's own size overpowers the title it
 * qualifies — see the note in WorkSection for the measurements. Same reason the
 * brackets sit closed up against the word.
 */
const QUALIFIER = `${LABEL} text-base`;

/**
 * A block of the log. The header is the home feed's, with a figure standing in
 * for the link: these sections don't go anywhere, so nothing should look like
 * it clicks. Header to content is the feed's 24px; the pieces of content
 * below that get 32px, so a chart and the note explaining it read as one
 * block rather than two.
 *
 * Each block takes the site's reveal as one unit — header, chart and note
 * arrive together. Whole, not piecemeal: this is data the reader came to
 * read, and the one motion it gets is the entrance every block on the site
 * gets. The bars inside still never animate (see the Chart note below).
 */
function Block({
  title,
  tag,
  meta,
  children,
}: {
  title: string;
  tag: string;
  meta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="reveal flex flex-col gap-6">
      <header className="flex items-center justify-between gap-6 text-[18px] leading-[1.2] tracking-[-0.16px]">
        <h2 className="flex min-w-0 items-center gap-4">
          <span className="truncate font-medium text-on-surface">{title}</span>
          <span className={`hidden shrink-0 ${QUALIFIER} text-oxley-700 sm:inline`}>
            [{tag}]
          </span>
        </h2>
        {meta && <div className="shrink-0 text-oxley-700">{meta}</div>}
      </header>
      <div className="flex flex-col gap-8">{children}</div>
    </section>
  );
}

/** One figure: the number, its unit, what it counts, and where it came from. */
function Figure({
  value,
  unit,
  label,
  sub,
}: {
  value: string;
  unit?: string;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-1.5">
        <span className={FIGURE}>{value}</span>
        {unit && (
          <span className={`${LABEL} text-[18px] text-oxley-700`}>{unit}</span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-base leading-[1.3] text-on-surface">{label}</span>
        <span className={`${LABEL} text-sm leading-[1.3] text-oxley-700`}>
          {sub}
        </span>
      </div>
    </div>
  );
}

function Figures({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
      {children}
    </div>
  );
}

/** A swatch in the chart's key, matching the fill it stands for. */
function Key({ className, children }: { className: string; children: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`inline-block size-2.5 ${className}`} />
      {children}
    </span>
  );
}

/**
 * Outings a month, runs stacked under walks so the run share reads off the
 * base of each bar. A month with nothing in it keeps a stub rather than going
 * blank, since an absent bar and a zero bar look the same otherwise.
 *
 * Each bar carries its count above it and its month below, so every value on
 * the chart is also written down — the bars are the shape of the year, not
 * the only way to read it. That's also why they're hidden from assistive tech
 * instead of being given labels that would repeat the text either side.
 *
 * The counts sit above the bars rather than beside the months, because a
 * number right-aligned in its own 223px cell lands closer to the next month's
 * label than to its own.
 *
 * Deliberately not animated. It's functional data the reader came for, and
 * growing the bars on load only works as a slow, showy entrance.
 */
/** Share of the track the tallest bar takes, leaving a lane for its count. */
const LANE = 0.88;

function Chart({ months, peak }: { months: Month[]; peak: number }) {
  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex items-end gap-2 border-b border-oxley-700/25"
        aria-hidden="true"
      >
        {months.map((month) => (
          <div
            key={month.label}
            className="flex h-[220px] flex-1 flex-col justify-end gap-2 sm:h-[300px] xl:h-[380px]"
          >
            <span
              className={`shrink-0 ${LABEL} text-sm leading-none text-oxley-700`}
            >
              {month.count}
            </span>
            <div
              className="flex shrink-0 flex-col"
              style={{
                height: `${
                  month.count
                    ? Math.max(8, Math.round((month.count / peak) * 100 * LANE))
                    : 3
                }%`,
              }}
            >
              {month.count === 0 ? (
                <div className="flex-1 bg-oxley-700/25" />
              ) : (
                <>
                  {month.walked > 0 && (
                    <div
                      className="bg-oxley-700/60"
                      style={{ flexGrow: month.walked }}
                    />
                  )}
                  {month.ran > 0 && (
                    <div
                      className="bg-on-surface"
                      style={{ flexGrow: month.ran }}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {months.map((month) => (
          <span
            key={month.label}
            className={`flex-1 ${LABEL} text-sm leading-none text-oxley-700`}
          >
            {month.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function RunningPage() {
  const d = getRunningData();

  return (
    <div className="flex flex-col gap-14 lg:gap-24">
      <Statement as="h1" className="reveal">{`Am I getting fitter?`}</Statement>

      <ProseColumns className="reveal">
        <p>{d.answer}</p>
        <p>{d.paceNote}</p>
      </ProseColumns>

      <Block
        title="Showing up"
        tag="Outings a month"
        meta={
          <span className="flex items-center gap-5 text-sm">
            <Key className="bg-on-surface">ran</Key>
            <Key className="bg-oxley-700/60">walked</Key>
          </span>
        }
      >
        <Chart months={d.monthly} peak={d.monthlyPeak} />
        <ProseColumns>
          <p>{d.showingUpNote}</p>
          <p>{d.runShareNote}</p>
        </ProseColumns>
      </Block>

      <Block title="The count" tag={`${d.year} so far`}>
        <Figures>
          <Figure value={String(d.yearKm)} unit="km" label="Covered" sub="this year" />
          <Figure value={String(d.yearOutings)} label="Outings" sub="Feb to now" />
          <Figure
            value={String(d.yearRuns)}
            label="Runs"
            sub={`of ${d.yearOutings}, at run pace`}
          />
          <Figure
            value={String(d.streakNow)}
            unit="weeks"
            label="Current streak"
            sub={`best ${d.streakBest}`}
          />
        </Figures>
        <p className={`${NOTE} text-on-surface`}>{d.streakNote}</p>
      </Block>

      <Block title="Bests" tag="Set this year">
        <Figures>
          {d.prs.map((pr) => (
            <Figure
              key={pr.label}
              value={pr.value}
              unit={pr.unit}
              label={pr.label}
              sub={pr.sub}
            />
          ))}
        </Figures>
        {d.pacingNote && (
          <p className={`${NOTE} text-on-surface`}>{d.pacingNote}</p>
        )}
      </Block>

      <Block
        title="When I run"
        tag="By time of day"
        meta={<span className={`${LABEL} text-sm`}>average pace</span>}
      >
        <div className="flex flex-col border-y border-oxley-700/25 divide-y divide-oxley-700/25">
          {d.timeOfDay.map((slot) => (
            <div
              key={slot.label}
              className="flex items-baseline justify-between gap-6 py-5 text-[18px] leading-[1.2] tracking-[-0.16px]"
            >
              <span className="min-w-0 truncate text-on-surface">{slot.label}</span>
              {/* The pace column is measured in `ch` now the face is monospaced:
                  one ch is one advance, so 8ch is exactly the width of the
                  widest value here ("12:16/km") with nothing left over. It used
                  to be w-20, which held 80px of Inter but only 7 of these 8
                  characters — the value spilled into the gap and that one row
                  sat closer to its count than the others. */}
              <span
                className={`flex shrink-0 items-baseline gap-4 ${LABEL} sm:gap-10`}
              >
                <span className="text-oxley-700">{slot.count} outings</span>
                <span className="w-[8ch] text-right text-on-surface">
                  {slot.pace}/km
                </span>
              </span>
            </div>
          ))}
        </div>
        <p className={`${NOTE} text-on-surface`}>{d.todNote}</p>
      </Block>

      {d.routes.length > 0 && (
        <Block
          title="The routes"
          tag="Traced from GPS"
          meta={
            <span className={`${LABEL} text-sm`}>
              {d.routes.length} with a clean trace
            </span>
          }
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
            {d.routes.map((route, index) => (
              <figure key={index} className="flex flex-col gap-4">
                <div className="aspect-square bg-oxley-700/10 p-8">
                  <svg
                    viewBox="0 0 100 100"
                    className="size-full text-on-surface"
                    aria-hidden="true"
                  >
                    <polyline
                      points={route.d}
                      fill="none"
                      className="stroke-current"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>
                <figcaption className="flex flex-col gap-1">
                  <span className="truncate text-base leading-[1.3] text-on-surface">
                    {route.name}
                  </span>
                  <span className={`${LABEL} text-sm leading-[1.3] text-oxley-700`}>
                    {route.km} km · {route.pace}/km · {route.date}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Block>
      )}

      <div className="reveal flex max-w-[40rem] flex-col gap-4 text-oxley-700">
        <p className={NOTE}>
          {`Without a heart-rate strap there's no honest way to chart fitness. On pace alone an easy day and a hard day look the same, so any fitness line would be lying. The day I start running with a watch, this page gets a real one. Until then it counts what it can: that I keep lacing up.`}
        </p>
        <p className={`${LABEL} text-sm`}>
          {`Read from my Strava export · ${d.yearOutings} outings this year · refreshed by hand`}
        </p>
      </div>
    </div>
  );
}
