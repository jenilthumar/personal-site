/**
 * Precompute GPX-derived running stats into data/running-gpx.json.
 *
 * The Strava archive's per-activity .gpx files carry the full GPS trace, which
 * the activities.csv summary can't give us: real segment bests (fastest 1 km /
 * 2 km), within-run splits, and route shapes. The raw GPX is large and lives
 * outside the repo, so we reduce it to a small JSON committed alongside the CSV.
 *
 *   node scripts/strava-gpx.mjs [gpxDir]
 *
 * gpxDir defaults to ./data/activities, or set STRAVA_GPX_DIR. Re-run whenever
 * you refresh the export.
 */
import fs from "node:fs";
import path from "node:path";

const SRC =
  process.argv[2] || process.env.STRAVA_GPX_DIR || path.join("data", "activities");
const OUT = path.join("data", "running-gpx.json");
const RUN_PACE = 600; // s/km; slower is a walk
const YEAR = 2026;
const MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");

const R = 6371000;
const rad = (d) => (d * Math.PI) / 180;
const hav = (a, b) => {
  const dLa = rad(b.lat - a.lat);
  const dLo = rad(b.lon - a.lon);
  const x =
    Math.sin(dLa / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};
const fmtPace = (s) =>
  `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
const label = (d) => `${MONTHS[d.getMonth()]} ${d.getDate()}`;

function read(file) {
  const xml = fs.readFileSync(file, "utf8");
  const name = xml.match(/<name>([^<]*)<\/name>/)?.[1] ?? "Run";
  const when = xml.match(/<metadata>\s*<time>([^<]+)/)?.[1];
  const re = /<trkpt lat="([-\d.]+)" lon="([-\d.]+)">[\s\S]*?<time>([^<]+)<\/time>/g;
  const pts = [];
  let m;
  while ((m = re.exec(xml))) {
    pts.push({ lat: +m[1], lon: +m[2], t: Date.parse(m[3]) / 1000 });
  }
  const cum = [0];
  const T = [pts[0]?.t ?? 0];
  for (let i = 1; i < pts.length; i++) {
    cum[i] = cum[i - 1] + hav(pts[i - 1], pts[i]);
    T[i] = pts[i].t;
  }
  return { name, when: when ? new Date(when) : null, pts, cum, T };
}

// Best pace (s/km) sustained over any window of >= Dm metres.
function fastest(cum, T, Dm) {
  let best = Infinity;
  let j = 0;
  const n = cum.length;
  for (let i = 0; i < n; i++) {
    if (j < i + 1) j = i + 1;
    while (j < n && cum[j] - cum[i] < Dm) j++;
    if (j >= n) break;
    const dp = cum[j] - cum[j - 1];
    const frac = dp > 0 ? (cum[i] + Dm - cum[j - 1]) / dp : 0;
    const tAt = T[j - 1] + (T[j] - T[j - 1]) * frac;
    const sPerKm = (tAt - T[i]) / (Dm / 1000);
    if (sPerKm < best) best = sPerKm;
  }
  return best;
}

// Per-kilometre split paces (seconds), by interpolating the km boundaries.
function splits(cum, T) {
  const marks = [T[0]];
  let k = 1;
  for (let i = 1; i < cum.length; i++) {
    while (cum[i] >= k * 1000) {
      const dp = cum[i] - cum[i - 1];
      const frac = dp > 0 ? (k * 1000 - cum[i - 1]) / dp : 0;
      marks.push(T[i - 1] + (T[i] - T[i - 1]) * frac);
      k++;
    }
  }
  const out = [];
  for (let i = 1; i < marks.length; i++) out.push(Math.round(marks[i] - marks[i - 1]));
  return out;
}

// Normalise a trace into a 100x100 box, aspect preserved, y flipped for SVG.
function routePath(pts) {
  const meanLat = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
  const k = Math.cos(rad(meanLat));
  const xy = pts.map((p) => [p.lon * k, p.lat]);
  const xs = xy.map((p) => p[0]);
  const ys = xy.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const span = Math.max(maxX - minX, maxY - minY) || 1;
  const pad = 8;
  const scale = (100 - 2 * pad) / span;
  const ox = pad + (100 - 2 * pad - (maxX - minX) * scale) / 2;
  const oy = pad + (100 - 2 * pad - (maxY - minY) * scale) / 2;
  const step = Math.max(1, Math.floor(pts.length / 120));
  const out = [];
  for (let i = 0; i < xy.length; i += step) {
    const x = ox + (xy[i][0] - minX) * scale;
    const y = 100 - (oy + (xy[i][1] - minY) * scale); // flip
    out.push(`${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`);
  }
  return out.join(" ");
}

const files = fs.readdirSync(SRC).filter((f) => f.endsWith(".gpx"));
const runs = [];
for (const f of files) {
  const r = read(path.join(SRC, f));
  if (!r.when || r.when.getFullYear() !== YEAR || r.pts.length < 10) continue;
  const km = r.cum[r.cum.length - 1] / 1000;
  const dur = r.T[r.T.length - 1] - r.T[0];
  if (!km || dur <= 0 || dur / km > RUN_PACE) continue; // walks out
  runs.push({
    date: r.when,
    name: r.name.replace(/[^\x20-\x7E]+/g, "").trim() || "Run",
    km,
    avg: dur / km,
    f1: fastest(r.cum, r.T, 1000),
    f2: fastest(r.cum, r.T, 2000),
    splits: splits(r.cum, r.T),
    points: routePath(r.pts),
  });
}
runs.sort((a, b) => a.date - b.date);

const best = (key) =>
  runs.filter((r) => isFinite(r[key])).reduce((m, r) => (r[key] < m[key] ? r : m));
const b1 = best("f1");
const b2 = best("f2");
const neg = runs.filter((r) => r.splits.length >= 2 && r.splits.at(-1) < r.splits[0]).length;

const out = {
  year: YEAR,
  fastest1k: { pace: fmtPace(b1.f1), date: label(b1.date) },
  fastest2k: { pace: fmtPace(b2.f2), date: label(b2.date) },
  pacing: { neg, total: runs.length },
  routes: runs
    .slice()
    .reverse()
    .slice(0, 6)
    .map((r) => ({
      date: label(r.date),
      name: r.name,
      km: r.km.toFixed(1),
      pace: fmtPace(r.avg),
      d: r.points,
    })),
};

fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${OUT} from ${runs.length} runs in ${SRC}`);
console.log(`  fastest 1k ${out.fastest1k.pace} (${out.fastest1k.date}), 2k ${out.fastest2k.pace}`);
console.log(`  negative splits ${neg}/${runs.length}`);
