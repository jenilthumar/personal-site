/**
 * The line field's drawing model, with no DOM in it.
 *
 * This is the shape of the picture — where the rows sit and where the ink
 * stops and starts — and nothing about how it gets painted. The home page
 * strokes it onto a canvas and animates it; the OG image renders the same
 * arrays to an SVG path at build time. Both import from here so the drawing on
 * the card is the drawing on the site, and a change to the texture can't move
 * one without the other.
 *
 * Everything downstream of `buildField` is presentation: the pointer, the
 * ripple, the colour, the theme. None of it belongs in this file.
 */

/** Distance between scanlines. The whole texture keys off this. */
export const ROW_GAP = 6;
/** Sampling step along a row. Smaller curves the long lines more smoothly. */
export const STEP = 2.5;

/**
 * Coherence never reaches zero, so the thin end keeps a scatter of dashes
 * rather than going empty — fading the top out is the caller's job, not the
 * noise's.
 */
const FLOOR = 0.14;

/* ── Texture scale ────────────────────────────────────────────────────────
   All in pixels, deliberately, rather than in fractions of the box.

   Sampling the noise at `2.6 / width` by `2.6 / height` seemed reasonable —
   the drawing keeps its proportions as the window changes — but it means the
   texture inherits the box's aspect ratio. Measured: a grain cell came out
   21 × 15px on a 1440 × 216 desktop band and 6 × 31px in a 390 × 441 phone
   field. The same drawing, squeezed to a fifth of its width and stretched to
   twice its height, which is why the phone read as a column of tall spikes
   instead of a horizon. A dash is a physical mark; it should be the same size
   on every screen — including on a 1200 × 630 card.

   GRAIN_X is roughly how long a dash runs, GRAIN_Y roughly how many rows one
   keeps its shape across, and the pair of them is the texture's whole
   character. */
const GRAIN_X = 1 / 21;
const GRAIN_Y = 1 / 15;
/**
 * Horizontal wavelength of the dissolve boundary. Absolute for the same
 * reason: proportional scaling gave 3.6 undulations across the screen at every
 * width, so a phone got the desktop's shoreline compressed into 107px peaks.
 */
const SHORE_X = 1 / 420;

/* ── Value noise ──────────────────────────────────────────────────────────
   A hash and a smoothstep, which is all this needs. Deterministic from the
   seed, so the drawing is the same every load rather than a new one each
   time — it's part of the page, not a slot machine. The card gets the same
   picture every build for the same reason. */
function hash(ix: number, iy: number, seed: number): number {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(seed, 362437);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const fade = (t: number) => t * t * (3 - 2 * t);

function noise(x: number, y: number, seed: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = fade(x - ix);
  const fy = fade(y - iy);
  const a = hash(ix, iy, seed);
  const b = hash(ix + 1, iy, seed);
  const c = hash(ix, iy + 1, seed);
  const d = hash(ix + 1, iy + 1, seed);
  return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
}

function fbm(x: number, y: number, seed: number, octaves: number): number {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise(x * freq, y * freq, seed + i * 101);
    norm += amp;
    freq *= 2;
    amp *= 0.5;
  }
  return sum / norm;
}

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
const smoothstep = (a: number, b: number, t: number) => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};

const SEED = 20260816;

/** Everything about the drawing that interaction can't change. */
export type Field = {
  width: number;
  height: number;
  cols: number;
  rows: number;
  rowY: Float32Array;
  coherence: Float32Array;
  grain: Float32Array;
};

export function buildField(width: number, height: number): Field {
  const cols = Math.ceil(width / STEP) + 1;
  const rows = Math.max(1, Math.floor((height - ROW_GAP) / ROW_GAP) + 1);
  const n = cols * rows;

  const field: Field = {
    width,
    height,
    cols,
    rows,
    rowY: new Float32Array(rows),
    coherence: new Float32Array(n),
    grain: new Float32Array(n),
  };

  // Only the shoreline's vertical extent still scales with the box: the
  // dissolve should span whatever depth there is, shallow band or tall field.
  // Everything else is in pixels — see the texture-scale note above.
  const sy = 2.6 / height;

  for (let row = 0; row < rows; row++) {
    const y = ROW_GAP + row * ROW_GAP;
    field.rowY[row] = y;
    const v = y / height;

    for (let col = 0; col < cols; col++) {
      const x = col * STEP;
      const u = x / width;
      const i = row * cols + col;

      /* Coherence: dense at the bottom-right, thinning up and to the left,
         with the boundary pushed around by low-frequency noise so it reads as
         a shoreline rather than a diagonal wipe. */
      const tilt = u * 0.42 + v * 0.58;
      const wander = (fbm(x * SHORE_X, y * sy * 1.4, SEED, 3) - 0.5) * 0.62;
      field.coherence[i] = FLOOR + (1 - FLOOR) * smoothstep(0.04, 0.95, tilt + wander);

      /* Ink is a threshold against a finer noise. It's what makes the dashes:
         at high coherence almost everything falls under the threshold and the
         row runs unbroken, and as coherence drops only the deepest troughs
         still ink, so segments shorten and spread on their own. No dash length
         is specified anywhere — the length is what's left over. */
      field.grain[i] = fbm(x * GRAIN_X, y * GRAIN_Y, SEED + 7, 2);
    }
  }

  return field;
}

/** Whether a sample is inked, given any boost the caller wants to apply. */
export function isInked(field: Field, index: number, boost = 0): boolean {
  return field.grain[index] < (field.coherence[index] + boost) * 0.96;
}

/**
 * The field as one SVG path: a `M`/`L` run per unbroken dash, flat rows, no
 * deformation. That's the resting state, which is the right one for a still —
 * the bend belongs to the pointer, and there's no pointer on a card.
 *
 * One path rather than one per dash keeps the markup small enough to inline as
 * a data URI, which is how it reaches Satori.
 */
export function fieldToPath(field: Field): string {
  const { cols, rows, rowY } = field;
  const out: string[] = [];

  for (let row = 0; row < rows; row++) {
    const y = rowY[row].toFixed(1);
    const base = row * cols;
    let start = -1;

    // One past the end, so a run reaching the right edge still gets closed.
    for (let col = 0; col <= cols; col++) {
      const inked = col < cols && isInked(field, base + col);
      if (inked) {
        if (start === -1) start = col;
        continue;
      }
      if (start === -1) continue;

      const x0 = start * STEP;
      // `H` rather than `L`: the rows are flat here, so the y never repeats.
      // A single-sample run would be a zero-length line and butt caps render
      // nothing, so it's given one step of width to keep the lone dashes.
      const x1 = col - 1 === start ? x0 + STEP : (col - 1) * STEP;
      out.push(`M${x0.toFixed(1)} ${y}H${x1.toFixed(1)}`);
      start = -1;
    }
  }

  return out.join("");
}
