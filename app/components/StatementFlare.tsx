"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
} from "react";

/**
 * The statement, with one phrase's words carrying the colour flare.
 *
 * This is the site's second client component, and it earns that for two
 * reasons.
 *
 * The first is that the flare has to finish once it has started. Driven by
 * `group-hover` alone it doesn't — un-hovering removes the animation and the
 * colour cuts to the ink in a single frame, mid-fade. Measured, not assumed: at
 * 506ms into the animation all four words were still fully coloured, and 10ms
 * later all four were back at #e6e6e6. A `transition` on `color` cannot catch
 * that; a removed animation isn't a style change it can interpolate from. So
 * the run is latched in state, `pointerenter` starts it, the last word's
 * `animationend` clears it, and the pointer can go where it likes in between.
 * Clearing at the end is invisible because the animation's last keyframe is the
 * ink colour the word returns to anyway.
 *
 * The second is the hint. Nothing about a paragraph suggests it does anything,
 * so it plays itself once shortly after load — the reader sees it happen, and
 * whether they then go looking for it is up to them. If they never do, it comes
 * back every 32 seconds so a later glance still catches it.
 *
 * Hovering resets that clock rather than being additional to it, so a manual
 * play is never followed moments later by an automatic one. It fires once per
 * pointer entry, too: moving around inside the statement doesn't retrigger it,
 * because `pointerenter` fires on entry and a re-entry mid-run is a no-op.
 */
const HINT_DELAY_MS = 1500;
const AUTOPLAY_MS = 32_000;

export function StatementFlare({
  as: Tag = "p",
  className,
  before,
  words,
  after,
  stagger,
  hues,
}: {
  as?: ElementType;
  className: string;
  /** Statement text either side of the flared phrase. */
  before: string;
  after: string;
  /** The phrase, already split on spaces. */
  words: string[];
  stagger: number;
  hues: number;
}) {
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const restart = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    // Reduced motion gets no timers at all, not just no animation — the CSS
    // would swallow the paint either way, but there's no reason to keep waking
    // up to schedule something that will never be seen. Watched rather than
    // read once, the way HeroVideo and FeedVideo watch it, so flipping the
    // system setting takes effect without a reload.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const schedule = (delay: number) => {
      clearTimeout(timer.current);
      if (reduce.matches) return;
      timer.current = setTimeout(() => {
        // A hidden tab isn't watching. Skip the play, keep the rhythm, so
        // coming back to the tab doesn't land on a burst of queued animation.
        if (document.visibilityState === "visible") setRunning(true);
        schedule(AUTOPLAY_MS);
      }, delay);
    };

    restart.current = () => schedule(AUTOPLAY_MS);
    const sync = () => schedule(reduce.matches ? 0 : HINT_DELAY_MS);

    sync();
    reduce.addEventListener("change", sync);
    return () => {
      clearTimeout(timer.current);
      reduce.removeEventListener("change", sync);
    };
  }, []);

  const play = useCallback(() => {
    setRunning(true);
    // Push the next automatic play a full interval out, so hovering never gets
    // followed straight away by the backup firing on its own schedule.
    restart.current?.();
  }, []);

  return (
    <Tag className={className} onPointerEnter={play}>
      {before}
      {words.map((word, index) => (
        <Fragment key={index}>
          {/* Spaces stay outside the spans, so each one holds a bare word and
              the line still breaks between them exactly as it did before. */}
          {index > 0 && " "}
          <span
            className={running ? "motion-safe:animate-flare" : undefined}
            style={
              {
                animationDelay: `${index * stagger}ms`,
                "--flare": `var(--flare-${(index % hues) + 1})`,
              } as CSSProperties
            }
            // The last word finishes last, so its end is the run's end.
            onAnimationEnd={
              index === words.length - 1 ? () => setRunning(false) : undefined
            }
          >
            {word}
          </span>
        </Fragment>
      ))}
      {after}
    </Tag>
  );
}
