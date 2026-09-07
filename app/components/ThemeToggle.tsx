"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * A two-way theme switch, drawn as a half-filled disc that turns.
 *
 * It used to be `[Auto]` cycling through three states in the footer. Three
 * states is the more honest model and it's still the model underneath — see
 * below — but as a control it asked the reader to press a word twice to find
 * out what the third press did. What's here now is a switch: one press, one
 * half turn, the mark points the other way.
 *
 * Auto survives as the default rather than as a position on the dial. Nothing
 * is stored until the switch is touched, and until then the palette follows the
 * OS live — the two rules in globals.css read `data-theme`'s absence, and this
 * component takes care never to write the attribute for someone who hasn't
 * asked. So a reader who never touches it keeps a theme that tracks their
 * system all day; a reader who does has said what they want and gets it.
 *
 * ── The turn ────────────────────────────────────────────────────────────────
 * The mark's resting orientation is a CSS variable that ships with the palette
 * (`--toggle-turn`: 0deg dark, 180deg light), not React state. That's what
 * makes it correct in the first painted frame: the inline script in the root
 * layout sets `data-theme` before anything renders, and the media query covers
 * everyone else, so there's no moment where a stored-light reader sees the disc
 * facing the wrong way, and nothing has to spin on hydration to fix it.
 *
 * `turns` is the tactile half of that, and it's the only thing this component
 * counts. A real switch doesn't rewind: press it four times and it has gone
 * round twice, not back and forth. But the CSS base alternates 0 → 180 → 0, so
 * every second press would run backwards on its own. Adding a full turn on the
 * presses that land on dark cancels that out:
 *
 *     press:   1      2      3      4
 *     base:    180    0      180    0
 *     turns:   0      360    360    720
 *     total:   180 →  360 →  540 →  720
 *
 * Always forwards, always exactly half a turn, and because `turns` starts at 0
 * and only moves on a click there's nothing here for the server and the client
 * to disagree about.
 *
 * The stored choice is read through useSyncExternalStore rather than an effect.
 * localStorage is external state that doesn't exist during the server render,
 * which is precisely what that hook is for. Subscribing also picks up the
 * `storage` event and the OS's own colour-scheme change, so a switch thrown in
 * one tab settles every other open tab, and an untouched tab follows the system
 * when it flips at sundown.
 */
type Theme = "light" | "dark";

const KEY = "theme";

/** Same-tab writes don't raise `storage`, so the store keeps its own list. */
const listeners = new Set<() => void>();

/**
 * Where the choice lives once storage has refused to take it. Safari in private
 * mode is the case: `getItem` answers, `setItem` throws, so a read-only check
 * doesn't catch it. Without this the snapshot would keep reporting the system
 * preference, and the switch would flip to the same side on every press while
 * the page behind it did change. Null until a write actually fails, so the
 * normal path never touches it.
 */
let memory: Theme | null = null;

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  const scheme = window.matchMedia("(prefers-color-scheme: light)");
  scheme.addEventListener("change", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
    scheme.removeEventListener("change", onChange);
  };
}

/** The explicit choice, or null for a reader who hasn't made one. */
function stored(): Theme | null {
  if (memory) return memory;
  try {
    const value = localStorage.getItem(KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    // Storage is gone entirely; the system preference is a fine answer.
    return null;
  }
}

/** What's actually on screen: the choice if there is one, the OS if not. */
function getSnapshot(): Theme {
  return (
    stored() ??
    (window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark")
  );
}

/**
 * Dark is the design's own default, so that's what the server assumes. It only
 * decides the accessible name for the few milliseconds before hydration — the
 * drawing is CSS's job and is right either way — and a screen reader doesn't
 * reach a control it hasn't been focused on that fast.
 */
const getServerSnapshot = (): Theme => "dark";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const next: Theme = theme === "dark" ? "light" : "dark";
  const [turns, setTurns] = useState(0);

  // The snapshot is the one source of truth for what's on <html>, which is what
  // makes the cross-tab case work: a `storage` event moves `theme` in a tab
  // nobody clicked, and the palette has to follow it there too. It writes the
  // stored value rather than the resolved one on purpose — for a reader who has
  // never chosen, `stored()` is null and the attribute stays off, so the media
  // query keeps the page tracking the OS instead of being pinned to whatever it
  // happened to say at load.
  useEffect(() => {
    const root = document.documentElement;
    const choice = stored();
    if (choice) root.dataset.theme = choice;
    else delete root.dataset.theme;
  }, [theme]);

  const flip = () => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      memory = next;
    }
    // See the table above: the presses that land on dark are the ones whose
    // base rotation runs backwards, so those are the ones that need a full
    // turn added to keep the switch moving one way.
    if (next === "dark") setTurns((t) => t + 360);
    listeners.forEach((notify) => notify());
  };

  return (
    <button
      type="button"
      onClick={flip}
      // The one sound in the palette that is literally a switch: a mechanical
      // click-clack. Declarative rather than a call inside `flip`, so it also
      // fires when the switch is activated from the keyboard.
      data-cuelume-toggle
      // The switch says nothing in words, so the name has to carry both the
      // state and what pressing it does.
      aria-label={`${theme === "dark" ? "Dark" : "Light"} theme. Switch to ${next}`}
      title={`Switch to ${next} theme`}
      // 44px of target on a phone bar, 32 on the wide one, in both cases far
      // more than the 16px mark inside it.
      //
      // The pull-out is `lg:` only, because it isn't a property of the switch
      // — it's a property of being the last control on the bar, and only the
      // wide bar ends with this one. Below `lg` the menu button sits to its
      // right and carries its own; a pull-out here as well would drag that
      // button 14px left and overlap two 44px targets, which is the one
      // mis-tap in this corner worth designing against.
      //
      // Muted, and it's the one thing here that took a second look. Set in the
      // primary ink it matched the nav words on paper and outweighed them on
      // screen: a solid half-disc puts far more ink in 16px than a letterform
      // does, so the brightest object in the masthead was the control nobody
      // came for. oxley-700 is the token this design already spends on chrome,
      // it's what the old bracketed toggle wore, and it still clears 5.1:1 —
      // well past the 3:1 a mark this size is held to. The hover is what makes
      // it a control: it comes up to full ink under the pointer.
      className={`flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center text-oxley-700 hover:text-on-surface lg:-mr-2 lg:h-8 lg:w-8 ${className}`}
    >
      {/* Two nested spans because the press and the turn are two different
          gestures on two different clocks. Outer: the compression under a
          finger, 150ms on the house curve, since it's pure response and
          nothing about it should be felt as motion. Inner: the half turn,
          400ms on the detent curve. They could share an element — Tailwind
          emits `scale` as its own property, so it doesn't collide with the
          inline `transform` — but not a transition, and the two timings are
          the whole effect. Press and it gives; release and it turns. */}
      <span className="flex motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-out-quart motion-safe:active:scale-[0.86]">
        <span
          className="flex motion-safe:transition-transform motion-safe:duration-[400ms] motion-safe:ease-detent"
          style={{
            transform: `rotate(calc(var(--toggle-turn) + ${turns}deg))`,
          }}
        >
          {/* A ring with one half filled in: the contrast mark, which is the
              one icon for this that doesn't have to pick a side. A sun and a
              moon are two drawings swapping places; this is one drawing
              turning, which is the only reason the motion reads as a
              mechanism. The fill is drawn at r=6 so it covers the ring's outer
              edge exactly and the two halves meet on one clean diameter. */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="8"
              cy="8"
              r="5.25"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path d="M8 2a6 6 0 0 0 0 12Z" fill="currentColor" />
          </svg>
        </span>
      </span>
    </button>
  );
}
