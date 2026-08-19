"use client";

import { useEffect, useRef } from "react";
import { buildField, isInked, STEP, type Field } from "@/lib/line-field";

/**
 * The drawing that fills the empty half of the first screen: rows of hairlines
 * draped over an invisible surface, unbroken where the field is dense and
 * dissolving into dashes where it thins out. The pointer lifts the surface
 * under it.
 *
 * Canvas, not WebGL, despite "shader" being the obvious word for it. The whole
 * character of this image is the hairline — a real 1px stroke, the same weight
 * everywhere, crisp at any density. A fragment shader has to rasterise those
 * lines itself, and thin near-horizontal lines are the exact case where that
 * goes wrong: they alias into dotted mush at some row spacings and shimmer at
 * others, and the fixes cost more code than the drawing does. Canvas strokes
 * them natively, integrates with the theme tokens without a uniform, and needs
 * no context-loss handling.
 *
 * ── Straight at rest ─────────────────────────────────────────────────────
 * The rows carry no displacement of their own. Every line sits exactly on its
 * scanline, dead level, evenly spaced, and the only thing that varies across
 * the drawing is where the ink stops and starts. All of the tone comes from
 * dash density: solid where the field is coherent, breaking into shorter and
 * sparser marks as it thins.
 *
 * An earlier pass draped the rows over a noise surface so they bunched into
 * darker bands, which is how the reference gets its shading. It was dropped on
 * purpose. Wobble at rest reads as an effect running on the page; a ruled field
 * reads as something that was drawn, and it makes the things that do move — the
 * pointer, and a click — unmistakable. Deformation is the interaction's alone.
 *
 * ── The ripple ───────────────────────────────────────────────────────────
 * A click drops a stone in. What spreads is a real travelling wave rather than
 * a scaling circle: the front moves outward at a constant speed, the surface
 * behind it oscillates at a fixed wavelength, and three separate things take
 * the amplitude down — the trailing envelope, 2D spreading as the same energy
 * goes round an ever-longer circle, and exponential damping over time. That
 * combination is why it reads as water and not as a CSS transition. There is
 * no easing curve anywhere in it; the shape comes out of the model.
 *
 * The crests are where the colour goes. Position in the wake maps onto a ramp
 * built from the six flare hues, swept once from the leading edge back to the
 * tail, so the wave carries a continuous wash outward with it rather than
 * painting bands that sit still. That means the frame can't be one stroke any
 * more: segments are batched by ramp step and overdrawn on the base pass.
 *
 * ── Why the noise is precomputed ─────────────────────────────────────────
 * The static fields cost ~17ms to evaluate across the whole canvas, measured.
 * That is a fine thing to spend once and an impossible thing to spend on every
 * frame of a pointer interaction. So coherence and grain are sampled once per
 * resize into typed arrays, and a frame after that is array reads plus a
 * falloff — no noise at all. The pointer term is analytic for the same reason.
 *
 * The model itself lives in lib/line-field, because the OG card draws the same
 * picture as a still at build time. Everything in this file is presentation
 * layered on top of it: the pointer, the ripple, the colour, the theme.
 */

/**
 * Pointer: how far it reaches, and how far it lifts the field. A lift of five
 * row gaps, against rows that were ruler straight a moment ago.
 *
 * It only lifts. It used to raise local coherence as well, so dashes knitted
 * into continuous lines under the cursor, and that drew a visible circle —
 * because the ink test is a hard threshold. Every sample whose grain sat just
 * above the line flipped to inked the moment the boost arrived, and the set of
 * samples that flipped has an edge. The edge is a contour of a radially
 * symmetric function, so it is a clean circle, and a clean circle in a drawing
 * with no other circles in it reads as a mask rather than as a surface.
 *
 * There's no soft version of that: the stroke is either laid down or it isn't,
 * so anything that moves the threshold has a boundary somewhere. Displacement
 * has no such problem — it moves ink that was already there, continuously.
 *
 * The falloff is a gaussian, and the reason is not smoothness. A polynomial
 * falloff can be made smooth to any order you like and the rim is still
 * visible, because what the eye catches here isn't a discontinuity — it's
 * curvature. Inside the reach the lines are bent; outside they are dead
 * straight; and against a field of ruled lines that contrast is legible no
 * matter how politely the two are stitched together. The only thing that hides
 * it is distance: a tail long enough that the bend gives out gradually instead
 * of within a defined radius.
 *
 * So REACH stops being where the bump ends and becomes only where it is cheap
 * to stop calculating it — three sigma out, the lift is 1.1% of its peak, which
 * at this amplitude is a third of a pixel.
 */
const LIFT = 34;
/** Width of the bump. The visible size of it is roughly this, not REACH. */
const SIGMA = 95;
const REACH = SIGMA * 3;
const INV_2SIGMA2 = 1 / (2 * SIGMA * SIGMA);
/** Per-frame easing of the pointer toward where it actually is. */
const EASE = 0.14;

/* ── Ripple ───────────────────────────────────────────────────────────────
   Physical constants, near enough. Speed is the wavefront in px/second and is
   deliberately constant — a wave that accelerates or eases reads as animation,
   not as water. Everything else only decides how fast it dies. */
const RIPPLE_SPEED = 380;
/** Distance between crests, and so the width of one colour band. */
const RIPPLE_WAVELENGTH = 70;
/**
 * How far behind the front the surface is still moving. Six wavelengths, so
 * the wake is six crests deep and every one of the six hues is on screen at
 * once — at two, the first pass only ever showed pink.
 */
const RIPPLE_TRAIL = 430;
/**
 * Crest height at the origin, before any of the three decays apply. Peak
 * displacement lands around 14px just after the click — a little over two row
 * gaps. At twice this the rows near the impact swapped places with each other
 * and the drawing tore rather than rippled.
 *
 * Nothing about the colour keys off this: the ramp is driven by the envelope,
 * so the wave can be made calmer or stronger without touching how it reads.
 */
const RIPPLE_AMP = 16;
/** Time constant of the damping, in ms. */
const RIPPLE_TAU = 1500;
/** Radius at which 2D spreading has halved the amplitude. */
const RIPPLE_SPREAD = 420;
/** Crests pull the dashes together, the way the pointer does. */
const RIPPLE_KNIT = 0.18;
/** Past this the wave is under a pixel and off the canvas; drop it. */
const RIPPLE_LIFE = 4200;
/** Impatient clicking shouldn't be able to grind the frame down. */
const RIPPLE_MAX = 5;
/** Below this a crest isn't strong enough to be worth colouring. */
const RIPPLE_COLOUR_GATE = 0.03;
/** At or above this a crest's colour is drawn at full strength. */
const RIPPLE_COLOUR_FULL = 0.22;
/**
 * Steps in the colour ramp across the wake. Six was the palette itself, one
 * hue per ring, and it banded hard — six saturated stripes with visible seams,
 * which read as a effect rather than as light on water. At 40 the seams are
 * under a pixel and the wake is a continuous wash.
 */
const RIPPLE_RAMP = 40;
/**
 * How far each ramp colour is pulled back toward the ink before it's used.
 * The palette is built for text, where a hue has to hold its own against the
 * background; here it's sitting on a hairline in a drawing that is otherwise
 * one colour, and at full strength it overwhelms it. This is the subtlety
 * knob — 0 is the raw palette, 1 is no colour at all.
 */
const RIPPLE_COLOUR_MIX = 0.42;
/** Ceiling on the wash's opacity, so even the brightest crest stays a tint. */
const RIPPLE_COLOUR_ALPHA = 0.8;

const TWO_PI = Math.PI * 2;

type Ripple = { x: number; y: number; start: number };

/* ── The wake's colour ramp ───────────────────────────────────────────────
   The six flare hues, spectrally ordered and interpolated into a smooth sweep
   that the wave carries from its leading edge back to its tail — once, not
   repeating. Ordering them by hue angle is what keeps the blend clean: the
   palette's own order is deliberately scattered so that neighbouring *words*
   contrast, and interpolating pink straight into green in that order runs the
   midpoint through mud. Sorted, every step is a short hop along the wheel.

   Interpolated in HSL rather than RGB for the same reason — RGB lerp between
   two saturated hues dips through grey in the middle. */
function parseRgb(value: string): [number, number, number] {
  const hex = value.trim();
  if (hex.startsWith("#")) {
    const n = hex.slice(1);
    const full =
      n.length === 3
        ? n
            .split("")
            .map((ch) => ch + ch)
            .join("")
        : n;
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ];
  }
  const parts = hex.match(/[\d.]+/g);
  return parts
    ? [Number(parts[0]), Number(parts[1]), Number(parts[2])]
    : [128, 128, 128];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h *= 60;
  return [h < 0 ? h + 360 : h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  // Both modulos matter: the first can return negative, the second is what
  // brings it back under 360. Without it `hp` lands in 6–12 rather than 0–6,
  // every hue falls past the last branch into magenta, and the whole ramp
  // comes out pink.
  const hp = ((((h % 360) + 360) % 360) / 60) % 6;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function buildRamp(hues: string[], ink: string): string[] {
  if (!hues.length) return [];
  const anchors = hues
    .map((hex) => rgbToHsl(...parseRgb(hex)))
    .sort((a, b) => b[0] - a[0]);
  const [ir, ig, ib] = parseRgb(ink);

  const ramp: string[] = [];
  for (let i = 0; i < RIPPLE_RAMP; i++) {
    const p = (i / (RIPPLE_RAMP - 1)) * (anchors.length - 1);
    const a = Math.min(anchors.length - 2, Math.floor(p));
    const f = p - a;
    const from = anchors[a];
    const to = anchors[a + 1] ?? from;
    const [r, g, b] = hslToRgb(
      from[0] + (to[0] - from[0]) * f,
      from[1] + (to[1] - from[1]) * f,
      from[2] + (to[2] - from[2]) * f,
    );
    const k = RIPPLE_COLOUR_MIX;
    ramp.push(
      `rgb(${Math.round(r + (ir - r) * k)},${Math.round(g + (ig - g) * k)},${Math.round(
        b + (ib - b) * k,
      )})`,
    );
  }
  return ramp;
}

/**
 * One frame. No noise is evaluated here — that is the whole point.
 *
 * Two passes over one loop: every segment goes into the base path, and any
 * segment sitting on a bright enough crest *also* goes into the Path2D for its
 * ring's hue. The base is stroked first and the hues over the top, so colour
 * blooms on the existing line instead of replacing it and leaving a hole where
 * the wave is weak.
 */
function paint(
  ctx: CanvasRenderingContext2D,
  field: Field,
  px: number,
  py: number,
  strength: number,
  ripples: Ripple[],
  hues: string[],
  now: number,
) {
  const { width, height, cols, rows, rowY, coherence } = field;
  ctx.clearRect(0, 0, width, height);
  ctx.beginPath();

  const reach2 = REACH * REACH;
  const live = strength > 0.002;

  // Per-ripple values that don't vary across the canvas, hoisted out of 30k
  // iterations of the inner loop.
  const n = ripples.length;
  const rx = new Float64Array(n);
  const ry = new Float64Array(n);
  const front = new Float64Array(n);
  const damp = new Float64Array(n);
  const inner = new Float64Array(n);
  let strongest = 0;
  for (let r = 0; r < n; r++) {
    const age = now - ripples[r].start;
    rx[r] = ripples[r].x;
    ry[r] = ripples[r].y;
    front[r] = (RIPPLE_SPEED * age) / 1000;
    damp[r] = Math.exp(-age / RIPPLE_TAU);
    // Nothing behind the trailing edge is still moving, so most of the canvas
    // can be rejected with two squared-distance compares and no sqrt.
    inner[r] = Math.max(0, front[r] - RIPPLE_TRAIL);
    if (damp[r] > strongest) strongest = damp[r];
  }

  const paths: (Path2D | null)[] = hues.map(() => null);
  // Strongest crest each hue reached this frame, which becomes that hue's
  // opacity. One global alpha for all six was the bug that made this look like
  // a two-colour effect: it fades every ring by the same amount, so by the time
  // the outer rings are large enough to read, the whole wave has gone muddy —
  // and on white a 45%-alpha jewel tone is barely a tint. Per hue, a strong
  // ring stays fully saturated while a weak one simply isn't there.
  const hueAlpha = new Float32Array(hues.length);
  const K = TWO_PI / RIPPLE_WAVELENGTH;

  for (let row = 0; row < rows; row++) {
    const baseY = rowY[row];
    const base = row * cols;
    let penDown = false;
    let penHue = -1;

    for (let col = 0; col < cols; col++) {
      const i = base + col;
      const x = col * STEP;
      // Dead level until something says otherwise.
      let y = baseY;
      let c = coherence[i];
      let hue = -1;
      let hueLift = 0;

      if (live) {
        // A soft bump under the pointer, gaussian so the bend gives out over a
        // long tail rather than at a radius.
        const dx = x - px;
        const dy = y - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < reach2) {
          y -= LIFT * Math.exp(-d2 * INV_2SIGMA2) * strength;
        }
      }

      for (let r = 0; r < n; r++) {
        const dx = x - rx[r];
        const dy = baseY - ry[r];
        const d2 = dx * dx + dy * dy;
        const outer = front[r];
        if (d2 > outer * outer || d2 < inner[r] * inner[r]) continue;

        const d = Math.sqrt(d2);
        const rel = outer - d; // how far behind the front this point sits
        const t = rel / RIPPLE_TRAIL;
        const fade = damp[r] * (1 / (1 + d / RIPPLE_SPREAD));
        const osc = Math.sin(rel * K);

        /* Two envelopes over the same wake, because geometry and colour want
           opposite things from its tail.

           Colour wants amplitude held far back: `sqrt` does that, and it's what
           lets the fifth and sixth ramp steps clear the gate at all — measured
           with a linear falloff they sat at 0.04 and the wave only ever showed
           four of its six hues.

           Geometry can't use it. `sqrt(1 - t)` has infinite slope at t = 1, so
           displacement falls off a cliff exactly at the wake's inner boundary
           and leaves a crease there — a circle, the same artifact the pointer
           had for a different reason. `(1 - t²)²` reaches zero with zero slope
           and zero curvature, so the moved rows rejoin the still ones invisibly.

           2D spreading and the damping are shared; only the tail shape differs. */
        const geom = (1 - t * t) * (1 - t * t) * fade;
        const tint = Math.sqrt(1 - t) * fade;

        y -= RIPPLE_AMP * geom * osc;
        const lift = tint * (osc < 0 ? -osc : osc);
        c += RIPPLE_KNIT * lift;
        if (lift > RIPPLE_COLOUR_GATE && lift > hueLift) {
          // Position in the wake, not ring number, so the colour sweeps the
          // ramp once from the leading edge back to the tail and travels
          // outward with the wave rather than sitting still under it.
          hue = (t * RIPPLE_RAMP) | 0;
          if (hue >= hues.length) hue = hues.length - 1;
          hueLift = lift;
        }
      }

      // The knit boost is handed to the shared ink test as a boost, so the
      // canvas and the OG card agree on what counts as inked.
      if (!isInked(field, i, c - coherence[i])) {
        penDown = false;
        penHue = -1;
        continue;
      }

      if (penDown) ctx.lineTo(x, y);
      else {
        ctx.moveTo(x, y);
        penDown = true;
      }

      if (hue >= 0) {
        let path = paths[hue];
        if (!path) path = paths[hue] = new Path2D();
        if (hueLift > hueAlpha[hue]) hueAlpha[hue] = hueLift;
        if (penHue === hue) path.lineTo(x, y);
        else {
          path.moveTo(x, y);
          penHue = hue;
        }
      } else penHue = -1;
    }
  }

  ctx.stroke();

  if (n > 0) {
    const previous = ctx.strokeStyle;
    for (let h = 0; h < paths.length; h++) {
      const path = paths[h];
      if (!path) continue;
      // A crest at RIPPLE_COLOUR_FULL or above is drawn at full strength; below
      // that it fades out rather than vanishing at the gate, which would pop.
      ctx.globalAlpha =
        Math.min(1, hueAlpha[h] / RIPPLE_COLOUR_FULL) * RIPPLE_COLOUR_ALPHA;
      ctx.strokeStyle = hues[h];
      ctx.stroke(path);
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = previous;
  }

  void height;
  void strongest;
}

export function LineField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let field: Field | null = null;
    let raf = 0;
    let resizeRaf = 0;

    // Where the pointer is, where the drawing currently thinks it is, and how
    // much of the effect is applied. Easing all three is what keeps a fast
    // mouse from tearing the surface.
    const target = { x: 0, y: 0, on: 0 };
    const eased = { x: 0, y: 0, on: 0 };

    let ripples: Ripple[] = [];
    // Read off the theme at build time; a theme change rebuilds and re-reads.
    let hues: string[] = [];

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const paintNow = (now: number) => {
      if (field) paint(ctx, field, eased.x, eased.y, eased.on, ripples, hues, now);
    };

    const tick = () => {
      const now = performance.now();
      // A ripple that has damped past a pixel and left the canvas is dropped,
      // which is also what lets the loop stop.
      if (ripples.length) {
        ripples = ripples.filter((r) => now - r.start < RIPPLE_LIFE);
      }

      eased.x += (target.x - eased.x) * EASE;
      eased.y += (target.y - eased.y) * EASE;
      eased.on += (target.on - eased.on) * EASE;
      paintNow(now);

      // Settle and stop. An idle drawing costs nothing, which is the whole
      // reason the interaction is affordable at this density.
      const moving =
        Math.abs(target.x - eased.x) > 0.4 ||
        Math.abs(target.y - eased.y) > 0.4 ||
        Math.abs(target.on - eased.on) > 0.002;
      if (moving || ripples.length) raf = requestAnimationFrame(tick);
      else {
        raf = 0;
        if (eased.on < 0.002) {
          eased.on = 0;
          paintNow(now);
        }
      }
    };

    const wake = () => {
      if (!raf && !reduce.matches) raf = requestAnimationFrame(tick);
    };

    const rebuild = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        // The host is measured, not the canvas. Writing `width`/`height` gives
        // a canvas an intrinsic aspect ratio, so a canvas that is itself the
        // flex item sizes its own height from the backing store it was just
        // handed — which resizes it, which redraws it. First run of this grew
        // the box to 688px and pushed the statement off the fold.
        const { width, height } = host.getBoundingClientRect();
        if (width <= 0 || height <= 0) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // The stroke follows the element's own colour, so the theme drives it
        // through the same token everything else uses and nothing here names
        // one.
        ctx.strokeStyle = getComputedStyle(canvas).color;
        ctx.lineWidth = 1;
        ctx.lineCap = "butt";

        // The wake borrows the statement flare's six hues, read from the same
        // tokens, so the two bits of colour on this page come from one palette
        // and a theme change re-reads both. They're smoothed into a ramp here
        // rather than used as six discrete bands.
        const root = getComputedStyle(document.documentElement);
        const palette = [1, 2, 3, 4, 5, 6]
          .map((n) => root.getPropertyValue(`--flare-${n}`).trim())
          .filter(Boolean);
        hues = buildRamp(palette, ctx.strokeStyle as string);

        field = buildField(width, height);
        paintNow(performance.now());
      });
    };

    rebuild();

    const observer = new ResizeObserver(rebuild);
    observer.observe(host);

    const onMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      target.x = event.clientX - rect.left;
      target.y = event.clientY - rect.top;
      target.on = 1;
      // First contact shouldn't drag the bump across the whole drawing from
      // wherever it was left.
      if (eased.on < 0.002) {
        eased.x = target.x;
        eased.y = target.y;
      }
      wake();
    };
    const onLeave = () => {
      target.on = 0;
      wake();
    };
    const onDown = (event: PointerEvent) => {
      if (reduce.matches) return;
      const rect = host.getBoundingClientRect();
      // Oldest goes first, so holding the mouse down doesn't stack ripples
      // until the frame gives out.
      if (ripples.length >= RIPPLE_MAX) ripples.shift();
      ripples.push({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        start: performance.now(),
      });
      wake();
    };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointercancel", onLeave);
    host.addEventListener("pointerdown", onDown);

    // A theme change restyles the stroke, and the drawing has to be laid down
    // again in the new colour. Both routes to one: the system preference, and
    // the data-theme the toggle writes onto <html>.
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    scheme.addEventListener("change", rebuild);
    const themed = new MutationObserver(rebuild);
    themed.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      observer.disconnect();
      themed.disconnect();
      scheme.removeEventListener("change", rebuild);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointercancel", onLeave);
      host.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    // Decorative — it carries nothing the sentence below it doesn't. Still a
    // pointer target, because that's the interaction.
    <div ref={hostRef} aria-hidden className={`relative ${className}`}>
      {/* Absolute, so the backing store can never talk back to the layout. */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full text-oxley-700"
      />
    </div>
  );
}
