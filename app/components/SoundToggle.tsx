"use client";

import { useSyncExternalStore } from "react";
import { play } from "cuelume";
import { readSound, soundServerSnapshot, subscribeSound, writeSound } from "./sound";

/**
 * The mute switch, drawn as a level meter that lies down.
 *
 * It sits beside the theme switch and is built the same way, for the same
 * reason: the drawing is a CSS variable that ships with the document
 * (`--sound-level`, 1 or 0), not React state, so it is already correct in the
 * first painted frame. The inline script in the root layout sets `data-sound`
 * before anything renders and nothing has to snap into place on hydration.
 *
 * Four bars scaled about their own centres, each landing at exactly 1.5px when
 * the level is 0, so muted is a dotted rule rather than four leftovers of
 * different weights. They fall in sequence — 30ms apart, tallest to shortest is
 * not the order, left to right is — because a meter that drops all at once
 * reads as a state swap and one that drops in order reads as a thing settling.
 *
 * No `data-cuelume-toggle` on this button, and that is the one non-obvious bit.
 * cuelume's delegation listens in the capture phase, so it would fire before
 * this handler runs: pressing mute would make a sound on its way out. Turning
 * sound back on plays its own cue below, where the order is right.
 */
const BARS = [5, 11, 7, 9];

export function SoundToggle({ className = "" }: { className?: string }) {
  const on = useSyncExternalStore(
    subscribeSound,
    readSound,
    soundServerSnapshot,
  );

  const flip = () => {
    writeSound(!on);
    // Only on the way up. Confirming a mute with a sound is the joke that
    // stops being funny the first time someone is in a meeting.
    if (!on) play("ready");
  };

  return (
    <button
      type="button"
      onClick={flip}
      aria-pressed={on}
      // The mark says nothing in words, so the name carries the state and what
      // pressing it does — same contract as the theme switch next door.
      aria-label={`Interaction sounds ${on ? "on" : "off"}. Turn ${on ? "off" : "on"}`}
      title={`Turn interaction sounds ${on ? "off" : "on"}`}
      // 44px of target on the phone bar, 32 on the wide one, matching the theme
      // switch exactly: the two are a pair in the corner and the moment one of
      // them is a different box the corner stops reading as chrome.
      className={`flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center text-oxley-700 hover:text-on-surface lg:h-8 lg:w-8 ${className}`}
    >
      {/* Outer span: the compression under a finger, 150ms, pure response.
          Inner marks carry the drop. Same two clocks as the theme switch. */}
      <span className="flex motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-out-quart motion-safe:active:scale-[0.86]">
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          {BARS.map((height, index) => {
            // Where the bar sits when the level is 0: 1.5px of the height it
            // was drawn at, so every bar lands on the same 1.5px dot.
            const floor = 1.5 / height;
            return (
              <rect
                key={index}
                x={2 + index * 3.5}
                y={8 - height / 2}
                width="1.5"
                height={height}
                rx="0.75"
                fill="currentColor"
                className="motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out-quart"
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  transform: `scaleY(calc(${floor.toFixed(4)} + ${(1 - floor).toFixed(4)} * var(--sound-level)))`,
                  transitionDelay: `${index * 30}ms`,
                }}
              />
            );
          })}
        </svg>
      </span>
    </button>
  );
}
