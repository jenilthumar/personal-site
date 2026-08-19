import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { buildField, fieldToPath } from "@/lib/line-field";

/**
 * The share card: the site's own drawing under the site's own name.
 *
 * Rendered once at build, not per request — nothing here varies. The field is
 * the same model the home page strokes onto a canvas (lib/line-field), so the
 * card and the page can't drift apart; only the way it's painted differs.
 *
 * Canvas isn't available to this renderer, which is Satori and knows only a
 * subset of CSS. So the field is emitted as one SVG path — flat rows, no
 * deformation, which is the drawing's resting state and the right one for a
 * still — and inlined as a data URI. One path rather than one element per dash
 * keeps that URI small enough to be worth doing.
 *
 * Fonts have to be handed over as buffers, and Satori reads ttf/otf/woff but
 * not woff2. The site's Inter arrives from a CDN as woff2 and the mono is a
 * woff2 subset, so neither could be reused: `app/fonts/Inter-{Regular,Medium}
 * .woff` are the latin subsets, 29KB each, bundled for this file alone. That's
 * also why "Designer" is set in Inter rather than in the mono the site uses for
 * its labels — the bracket idiom survives, the typeface doesn't.
 */

export const alt = "Jenil Thummar — Designer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Matches the dark theme's tokens: the site's default, so the card looks like it. */
const SURFACE = "#000000";
const ON_SURFACE = "#e6e6e6";
const MUTED = "#767d93";

/** How much of the card's foot the drawing takes. */
const FIELD_HEIGHT = 300;

export default async function OpengraphImage() {
  const [regular, medium] = await Promise.all([
    readFile(join(process.cwd(), "app/fonts/Inter-Regular.woff")),
    readFile(join(process.cwd(), "app/fonts/Inter-Medium.woff")),
  ]);

  const field = buildField(size.width, FIELD_HEIGHT);
  // The drawing already thins upward, so the gradient only has to finish it —
  // same job the CSS mask does on the page, done here with an SVG mask because
  // Satori applies CSS masks to elements, not to the inside of an image.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${FIELD_HEIGHT}" viewBox="0 0 ${size.width} ${FIELD_HEIGHT}">
<defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#fff" stop-opacity="0"/>
<stop offset="0.32" stop-color="#fff" stop-opacity="1"/>
</linearGradient><mask id="m"><rect width="100%" height="100%" fill="url(#f)"/></mask></defs>
<path d="${fieldToPath(field)}" stroke="${MUTED}" stroke-width="1" fill="none" mask="url(#m)"/></svg>`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: SURFACE,
          fontFamily: "Inter",
        }}
      >
        {/* The type sits where the statement sits on the page: left, on the
            same gutter, above the drawing rather than over it. Nothing is
            centred — the site isn't. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "0 72px 56px",
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 500,
              letterSpacing: "-0.032em",
              lineHeight: 1.05,
              color: ON_SURFACE,
            }}
          >
            Jenil Thummar
          </div>
          {/* Bracketed, the way every label on the site is. */}
          <div
            style={{
              marginTop: 20,
              fontSize: 30,
              fontWeight: 400,
              letterSpacing: "0.02em",
              color: MUTED,
            }}
          >
            [ Designer ]
          </div>
        </div>

        <img
          width={size.width}
          height={FIELD_HEIGHT}
          alt=""
          src={`data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`}
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: regular, style: "normal", weight: 400 },
        { name: "Inter", data: medium, style: "normal", weight: 500 },
      ],
    },
  );
}
