import type { ElementType, ReactNode } from "react";
import { StatementFlare } from "./StatementFlare";

/**
 * The site's opening line, set large: 56px over the design's 1376 measure,
 * which it holds even where the frame runs on to 1920 — past that width the
 * line just gets long rather than grand.
 *
 * Leading and tracking are solved for the size rather than fixed, because the
 * design's values are display values. At 1.05 and -0.0429em they're right on a
 * 56px line and wrong on the 28px one a phone gets: 1.05 leaves a 29px line box,
 * so six lines of statement close up into a slab, and -0.0429em is -1.2px at
 * that size, which squeezes the words on top of it.
 *
 * Both are straight lines through the two ends of the clamp — 1.2 / -0.02em at
 * 28px, the design's 1.05 / -2.4px at 56px — expressed as one calc each so they
 * track the size continuously instead of stepping at a breakpoint. At exactly
 * 56px they resolve to 58.8px and -2.4px, so the drawn size is unchanged.
 *
 * The opsz pin is what `h1, h2` get in globals.css, restated here so a
 * statement set as a paragraph renders at the same display end of the axis.
 *
 * `text-balance` evens the line lengths so the last line isn't left short.
 * It's a browser hint rather than a guarantee: Blink only balances up to six
 * lines and gives up past that, which is exactly where a phone lands this
 * statement — so it shapes the wide sizes and quietly does nothing on the
 * narrow ones. That's the right way round, since a short last line is only
 * conspicuous when the lines above it are long.
 */
const STATEMENT =
  "max-w-[1376px] py-2.5 text-[clamp(1.75rem,4.07vw,3.5rem)] font-medium text-balance leading-[calc(0.9em_+_8.4px)] tracking-[calc(1.28px_-_0.0658em)] text-on-surface [font-variation-settings:'opsz'_32]";

/**
 * Word flare: a colour runs through one phrase of the statement, a word at a
 * time, and fades back to the ink. Hovering plays it; so does the page itself,
 * once shortly after load and every 32s after that (see StatementFlare).
 *
 * Per word rather than per letter, which is the whole reason it's usable here.
 * Splitting text into per-character spans makes every character its own text
 * run, and kerning pairs and ligatures don't cross a run boundary — this site
 * turns `liga` and `calt` on explicitly and sets the statement at up to 56px,
 * where that damage is plainly visible. Word boundaries already break the run,
 * so splitting there costs nothing: the only pairs lost are the ones either
 * side of a space, which barely kern in any face.
 *
 * 110ms between words. The reference this is drawn from staggers ~32ms a
 * glyph, and a five-letter word is about 160ms of that, so it reads at roughly
 * the same pace while moving a quarter as many things.
 *
 * The splitting happens here, on the server. Only the playing of it — the
 * latch that survives a pointer-leave, and the timers behind the hint — is
 * client-side (see StatementFlare).
 *
 * Six hues against four words means the phrase never uses the whole set, and a
 * longer phrase would wrap around to pink rather than run out.
 */
const FLARE_STAGGER_MS = 110;
const FLARE_HUES = 6;

export function Statement({
  as: Tag = "p",
  flare,
  children,
}: {
  /** `h1` where the statement is the page's heading, `p` where it's prose. */
  as?: ElementType;
  /** Phrase within the text to run the hover flare through. Omit for none. */
  flare?: string;
  children: ReactNode;
}) {
  // A phrase that isn't in the text — or isn't set at all — leaves the
  // statement as one plain string on the server, so emptying `statementFlare`
  // in lib/site turns the effect off and the client component with it.
  const at =
    flare && typeof children === "string" ? children.indexOf(flare) : -1;

  if (at === -1 || typeof children !== "string" || !flare) {
    return <Tag className={STATEMENT}>{children}</Tag>;
  }

  return (
    <StatementFlare
      as={Tag}
      className={STATEMENT}
      before={children.slice(0, at)}
      words={flare.split(" ")}
      after={children.slice(at + flare.length)}
      stagger={FLARE_STAGGER_MS}
      hues={FLARE_HUES}
    />
  );
}
