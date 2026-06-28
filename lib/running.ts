/**
 * Running data, read from a Strava export.
 *
 * Strava gated its API behind a paid subscription, so instead of a live OAuth
 * feed we parse the free account archive (`data/activities.csv`). To refresh,
 * request a new archive from Strava and replace that file.
 *
 * The page is scoped to the current year — the season Jenil started running
 * seriously. Earlier years are parsed (for week math) but not shown. There's no
 * heart rate in the export (phone GPS only), so we don't fake a fitness curve;
 * we show consistency, the walk-to-run shift across the year, when the running
 * happens, and the totals.
 */
import fs from "node:fs";
import path from "node:path";

export type Outing = { date: string; name: string; km: string; pace: string };
export type Month = { label: string; count: number; ran: number; walked: number };
export type Slot = { label: string; count: number; pace: string };
export type PR = { value: string; unit: string; label: string; sub: string };
export type Route = {
  name: string;
  date: string;
  km: string;
  pace: string;
  d: string;
};
/** Precomputed by scripts/strava-gpx.mjs from the per-activity GPX traces. */
type GpxData = {
  fastest1k: { pace: string; date: string };
  fastest2k: { pace: string; date: string };
  pacing: { neg: number; total: number };
  routes: Route[];
};

export type RunningData = {
  answer: string;
  year: number;
  // showing up + walk-to-run, by month, this year
  monthly: Month[];
  monthlyPeak: number;
  showingUpNote: string;
  runShareNote: string;
  paceNote: string;
  // streak
  streakNow: number;
  streakBest: number;
  streakNote: string;
  // when it happens
  timeOfDay: Slot[];
  todNote: string;
  // personal bests, this year
  prs: PR[];
  pacingNote: string;
  routes: Route[];
  // the count, this year
  yearKm: number;
  yearOutings: number;
  yearRuns: number;
  recent: Outing[];
};

const MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
const FILE = path.join(process.cwd(), "data", "activities.csv");
/** A "run" here is an outing held at 10:00/km or quicker; slower is a walk. */
const RUN_PACE = 600;

function tokenize(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else q = false;
      } else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out;
}

type Parsed = {
  date: Date;
  dateLabel: string;
  name: string;
  km: number;
  paceSec: number; // per km, from moving time
  istHour: number; // local hour; Strava stamps UTC and Surat is +5:30
  ran: boolean;
};

/**
 * Strava's archive CSV: 1 date, 2 name, 3 type; the detailed metric block
 * starts at index 16 (after gear/filename), so 17 moving time, 18 distance (m).
 * Verified against the file.
 */
function parse(): Parsed[] {
  const raw = fs.readFileSync(FILE, "utf8").trim();
  const rows = raw.split(/\r?\n/).slice(1).map(tokenize);
  return rows
    .map((r): Parsed | null => {
      const m = r[1]?.match(/(\w{3}) (\d+), (\d{4}), (\d+):(\d+):(\d+) (AM|PM)/);
      if (!m) return null;
      const date = new Date(+m[3], MONTHS.indexOf(m[1]), +m[2]);
      const moving = Number(r[17]) || Number(r[16]);
      const km = Number(r[18]) / 1000;
      if (!km || !moving) return null;
      let h = +m[4] % 12;
      if (m[7] === "PM") h += 12;
      const paceSec = Math.round(moving / km);
      return {
        date,
        dateLabel: `${m[1]} ${+m[2]}`,
        name: (r[2] || "Run").replace(/[^\x20-\x7E]+/g, "").trim() || "Run",
        km,
        paceSec,
        istHour: (h + +m[5] / 60 + 5.5) % 24,
        ran: paceSec <= RUN_PACE,
      };
    })
    .filter((a): a is Parsed => a !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

const fmtPace = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

const avgPace = (list: Parsed[]) =>
  list.length ? fmtPace(list.reduce((s, a) => s + a.paceSec, 0) / list.length) : "—";

function weekKey(d: Date): string {
  const x = new Date(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x.toISOString().slice(0, 10);
}

function streaks(weeks: string[]): { best: number; now: number } {
  let best = weeks.length ? 1 : 0;
  let cur = weeks.length ? 1 : 0;
  for (let i = 1; i < weeks.length; i++) {
    const diff = Math.round(
      (new Date(weeks[i]).getTime() - new Date(weeks[i - 1]).getTime()) /
        (7 * 86_400_000),
    );
    cur = diff === 1 ? cur + 1 : 1;
    best = Math.max(best, cur);
  }
  return { best, now: cur };
}

/** Monday (local) of an activity's week, as a Date — for "week of" labels. */
function mondayOf(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

function slot(acts: Parsed[], label: string, lo: number, hi: number): Slot | null {
  const inSlot = acts.filter((a) => a.istHour >= lo && a.istHour < hi);
  if (!inSlot.length) return null;
  return { label, count: inSlot.length, pace: avgPace(inSlot) };
}

function build(): RunningData {
  const acts = parse();
  let gpx: GpxData | null = null;
  try {
    gpx = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "data", "running-gpx.json"), "utf8"),
    ) as GpxData;
  } catch {
    gpx = null;
  }
  const latest = acts[acts.length - 1].date;
  const year = latest.getFullYear();
  const curMonth = latest.getMonth();
  const focus = acts.filter((a) => a.date.getFullYear() === year);

  // Showing up + walk-to-run, month by month this year
  const monthly: Month[] = [];
  for (let mo = 0; mo <= curMonth; mo++) {
    const inMo = focus.filter((a) => a.date.getMonth() === mo);
    monthly.push({
      label: MONTHS[mo],
      count: inMo.length,
      ran: inMo.filter((a) => a.ran).length,
      walked: inMo.filter((a) => !a.ran).length,
    });
  }
  const monthlyPeak = Math.max(...monthly.map((m) => m.count), 1);
  const firstActive = monthly.find((m) => m.count > 0) ?? monthly[0];
  const lastMonth = monthly[monthly.length - 1];

  // Streak, within the year
  const { best, now } = streaks(
    [...new Set(focus.map((a) => weekKey(a.date)))].sort(),
  );

  // Time of day, within the year
  const timeOfDay = [
    slot(focus, "Morning", 4, 11),
    slot(focus, "Evening", 16, 22),
    slot(focus, "Night", 22, 28),
  ].filter((s): s is Slot => s !== null);
  const morning = timeOfDay.find((s) => s.label === "Morning");
  const evening = timeOfDay.find((s) => s.label === "Evening");

  const yearOutings = focus.length;
  const yearRuns = focus.filter((a) => a.ran).length;
  const pStart = avgPace(focus.filter((a) => a.date.getMonth() === MONTHS.indexOf(firstActive.label)));
  const recentRuns = focus.filter((a) => a.date.getMonth() === curMonth && a.ran);
  const pRecent = avgPace(
    recentRuns.length ? recentRuns : focus.filter((a) => a.date.getMonth() === curMonth),
  );

  // Personal bests, this year
  const runs = focus.filter((a) => a.ran);
  const longestRun = runs.reduce((m, a) => (a.km > m.km ? a : m));
  const fastestRun = runs.reduce((m, a) => (a.paceSec < m.paceSec ? a : m));
  const weekKm = new Map<number, { km: number; mon: Date }>();
  for (const a of focus) {
    const mon = mondayOf(a.date);
    const cur = weekKm.get(mon.getTime()) ?? { km: 0, mon };
    cur.km += a.km;
    weekKm.set(mon.getTime(), cur);
  }
  let bigWeek = { km: 0, mon: latest };
  for (const w of weekKm.values()) if (w.km > bigWeek.km) bigWeek = w;
  const bestMonth = monthly.reduce((m, x) => (x.count >= m.count ? x : m));
  const weekOf = `week of ${MONTHS[bigWeek.mon.getMonth()]} ${bigWeek.mon.getDate()}`;
  const longestPR: PR = { value: longestRun.km.toFixed(2), unit: "km", label: "Longest run", sub: longestRun.dateLabel };
  const weekPR: PR = { value: bigWeek.km.toFixed(1), unit: "km", label: "Biggest week", sub: weekOf };
  // GPX gives true segment bests (fastest sustained 1 km / 2 km); the CSV only
  // has whole-run averages, so we prefer the GPX numbers when present.
  const prs: PR[] = gpx
    ? [
        longestPR,
        { value: gpx.fastest1k.pace, unit: "/km", label: "Fastest 1 km", sub: gpx.fastest1k.date },
        { value: gpx.fastest2k.pace, unit: "/km", label: "Fastest 2 km", sub: gpx.fastest2k.date },
        weekPR,
      ]
    : [
        longestPR,
        {
          value: fmtPace(fastestRun.paceSec),
          unit: "/km",
          label: "Fastest pace",
          sub: `${fastestRun.dateLabel}, ${fastestRun.km.toFixed(1)} km`,
        },
        weekPR,
        { value: String(bestMonth.count), unit: "outings", label: "Busiest month", sub: bestMonth.label },
      ];

  return {
    answer:
      "I started taking running seriously this year, so this is where I keep count. Whether I'm fitter, I can't say yet: I run with just a phone, no heart-rate strap, so nothing here measures the engine. What it shows is simpler, and enough for now: I keep showing up.",
    year,
    monthly,
    monthlyPeak,
    showingUpNote: `${yearOutings} outings this year, and the recent months are the busiest of them.`,
    runShareNote: `In ${firstActive.label} I was mostly walking. By ${lastMonth.label}, ${lastMonth.ran} of ${lastMonth.count} outings were runs.`,
    paceNote: `In ${firstActive.label} I was walking, nearer ${pStart} a kilometre. The ${lastMonth.label} runs sit closer to ${pRecent}. That shift is the part I watch.`,
    streakNow: now,
    streakBest: best,
    streakNote:
      now >= best
        ? `${now} weeks in a row with a run, the longest I've kept going this year.`
        : `${now} weeks in a row and counting. The best this year is ${best}. Beating that is the goal.`,
    timeOfDay,
    todNote:
      morning && evening
        ? `The morning runs average ${morning.pace} a kilometre, the evening ones ${evening.pace}. Morning is when I actually run, so that's the slot to protect.`
        : "",
    prs,
    pacingNote: gpx
      ? `Of the ${gpx.pacing.total} runs with a clean GPS trace, I finished faster than I started on ${gpx.pacing.neg}. The splits still swing a lot from one kilometre to the next. Holding an even pace is the next thing to learn.`
      : "",
    routes: gpx?.routes ?? [],
    yearKm: Math.round(focus.reduce((s, a) => s + a.km, 0)),
    yearOutings,
    yearRuns,
    recent: focus
      .slice(-6)
      .reverse()
      .map((a) => ({
        date: a.dateLabel,
        name: a.name,
        km: a.km.toFixed(1),
        pace: fmtPace(a.paceSec),
      })),
  };
}

let cached: RunningData | null = null;
export function getRunningData(): RunningData {
  if (!cached) cached = build();
  return cached;
}
