import type { ReactNode } from "react";
import { getRunningData } from "@/lib/running";

export const metadata = {
  title: "Am I getting fitter?",
  description:
    "A new running habit, read honestly from a Strava export. Not a dashboard, just a record of finally showing up.",
};

/* ──────────────────────────────────────────────────────────────────────────
   Scoped to this year — the season the running got serious. No heart rate in
   the export, so no faked fitness curve. Editorial layout: a small-caps label
   gutter on the left, content on the right, hairline rules between rows.
   Data: lib/running.
   ────────────────────────────────────────────────────────────────────────── */

/** One labelled section: label in the left gutter, content on the right.
   Symmetric `py` so the dividers (on the wrapper) sit centered in whitespace. */
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="grid gap-x-10 gap-y-4 py-9 lg:grid-cols-[7rem_minmax(0,1fr)]">
      <h2 className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-oxley-700">
        {label}
      </h2>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function Stat({
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
    <div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[1.9rem] font-medium leading-none tracking-[-0.02em] text-oxley-300 tabular-nums">
          {value}
        </span>
        {unit && <span className="text-sm text-oxley-700">{unit}</span>}
      </div>
      <div className="mt-3 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-oxley-700">
        {label}
      </div>
      <div className="mt-1 text-xs text-oxley-700 tabular-nums">{sub}</div>
    </div>
  );
}

export default function RunningPage() {
  const d = getRunningData();

  return (
    <div className="max-w-[66rem] pb-24">
      {/* Masthead */}
      <header className="max-w-[44rem]">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-oxley-700">
          Field log · running · {d.year}
        </p>
        <h1 className="mt-4 text-balance text-[2rem] font-medium leading-[1.1] tracking-[-0.02em] text-oxley-300 sm:text-[2.7rem]">
          {`Am I getting fitter?`}
        </h1>
        <p className="mt-7 text-pretty text-[1.2rem] leading-8 text-on-surface">
          {d.answer}
        </p>
      </header>

      <div className="mt-10 border-t border-white/10 divide-y divide-white/10">
        {/* Showing up — outings a month, and how many were runs */}
        <Row label="Showing up">
          <div className="mb-4 flex justify-end gap-3 text-[0.7rem] text-oxley-700">
            <span className="flex items-center gap-1.5">
              <span className="inline-block size-2 bg-oxley-300" /> ran
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block size-2 bg-oxley-700/55" /> walked
            </span>
          </div>
          <div className="flex h-[150px] items-end gap-1.5">
            {d.monthly.map((m, i) => {
              const h = m.count
                ? Math.max(8, Math.round((m.count / d.monthlyPeak) * 100))
                : 4;
              if (m.count === 0) {
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t-[1px] bg-oxley-700/30"
                    style={{ height: `${h}%` }}
                  />
                );
              }
              return (
                <div
                  key={i}
                  className="flex flex-1 flex-col overflow-hidden rounded-t-[1px]"
                  style={{ height: `${h}%` }}
                >
                  {m.walked > 0 && (
                    <div className="bg-oxley-700/55" style={{ flexGrow: m.walked }} />
                  )}
                  {m.ran > 0 && (
                    <div className="bg-oxley-300" style={{ flexGrow: m.ran }} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex gap-1.5 text-[0.65rem] text-oxley-700">
            {d.monthly.map((m, i) => (
              <span key={i} className="flex-1 text-center">
                {i === d.monthly.length - 1 ? "now" : m.label}
              </span>
            ))}
          </div>
          <p className="mt-6 max-w-[58ch] text-pretty text-base leading-7 text-on-surface">
            {d.showingUpNote} {d.runShareNote}
          </p>
        </Row>

        {/* The pace */}
        <Row label="The pace">
          <p className="max-w-[58ch] text-pretty text-base leading-7 text-on-surface">
            {d.paceNote}
          </p>
        </Row>

        {/* Streak */}
        <Row label="Streak">
          <div className="flex items-baseline gap-3">
            <span className="text-[2.2rem] font-medium leading-none tracking-[-0.02em] text-oxley-300 tabular-nums">
              {d.streakNow}
            </span>
            <span className="text-sm text-oxley-700 tabular-nums">
              weeks running · best {d.streakBest}
            </span>
          </div>
          <p className="mt-4 max-w-[56ch] text-pretty text-base leading-7 text-on-surface">
            {d.streakNote}
          </p>
        </Row>

        {/* Personal bests */}
        <Row label="Bests">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            {d.prs.map((p) => (
              <Stat
                key={p.label}
                value={p.value}
                unit={p.unit}
                label={p.label}
                sub={p.sub}
              />
            ))}
          </div>
        </Row>

        {/* Splits */}
        {d.pacingNote && (
          <Row label="Splits">
            <p className="max-w-[58ch] text-pretty text-base leading-7 text-on-surface">
              {d.pacingNote}
            </p>
          </Row>
        )}

        {/* When I run */}
        <Row label="When I run">
          <div className="flex flex-col divide-y divide-white/5 border-y border-white/5">
            {d.timeOfDay.map((s) => (
              <div
                key={s.label}
                className="flex items-baseline justify-between gap-4 py-3"
              >
                <span className="text-oxley-300">{s.label}</span>
                <div className="flex shrink-0 items-baseline gap-5 tabular-nums">
                  <span className="text-oxley-700">{s.count} outings</span>
                  <span className="w-20 text-right text-on-surface">
                    {s.pace}/km
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 max-w-[56ch] text-pretty text-base leading-7 text-on-surface">
            {d.todNote}
          </p>
        </Row>

        {/* The count */}
        <Row label="The count">
          <div className="grid grid-cols-3 gap-x-6 gap-y-8">
            <Stat
              value={String(d.yearKm)}
              unit="km"
              label={`In ${d.year}`}
              sub="this year"
            />
            <Stat
              value={String(d.yearOutings)}
              label="Outings"
              sub="Feb to now"
            />
            <Stat
              value={String(d.yearRuns)}
              label="Runs"
              sub={`of ${d.yearOutings}, at run pace`}
            />
          </div>
        </Row>

        {/* The routes */}
        {d.routes.length > 0 && (
          <Row label="The routes">
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
              {d.routes.map((r, i) => (
                <figure key={i} className="flex flex-col gap-3">
                  <div className="aspect-square overflow-hidden border border-white/10 bg-white/2 p-4">
                    <svg
                      viewBox="0 0 100 100"
                      className="size-full text-oxley-300"
                      aria-hidden="true"
                    >
                      <polyline
                        points={r.d}
                        fill="none"
                        className="stroke-current"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <figcaption className="flex flex-col gap-0.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm text-oxley-300">
                        {r.name}
                      </span>
                      <span className="shrink-0 text-[0.7rem] text-oxley-700">
                        {r.date}
                      </span>
                    </div>
                    <div className="text-[0.7rem] text-oxley-700 tabular-nums">
                      {r.km} km · {r.pace}/km
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Row>
        )}

        {/* What this can't see */}
        <Row label="Caveat">
          <p className="max-w-[62ch] text-pretty text-sm leading-6 text-oxley-700">
            {`Without a heart-rate strap there's no honest way to chart fitness. On pace alone an easy day and a hard day look the same, so any fitness line would be lying. The day I start running with a watch, this page gets a real one. Until then it counts what it can: that I keep lacing up.`}
          </p>
        </Row>

        <p className="py-9 text-[0.7rem] text-oxley-700 tabular-nums">
          {`Read from my Strava export · ${d.yearOutings} outings this year · refreshed by hand`}
        </p>
      </div>
    </div>
  );
}
