"use client";

import { useSyncExternalStore } from "react";

/**
 * Three states, one control: follow the system, or override it either way.
 *
 * "Auto" is the absence of `data-theme` rather than a value of its own, so the
 * default costs nothing — no script has to run and no attribute has to be set
 * for a first-time reader to get the palette their OS asked for. Choosing
 * light or dark writes the attribute and stores it; choosing Auto removes
 * both. See the two rules in globals.css that read it.
 *
 * It cycles rather than offering three targets. A segmented control would say
 * more, but it would be the largest piece of chrome on a site whose footer is
 * otherwise four lines of small print, and the state is always written out.
 *
 * The stored choice is read through useSyncExternalStore rather than an effect.
 * localStorage is external state that doesn't exist during the server render,
 * which is precisely what that hook is for — it takes a server snapshot, so
 * there's no hydration mismatch, and no setState-in-an-effect to paint the
 * wrong label first. Subscribing also picks up the `storage` event, so changing
 * the theme in one tab settles every other open tab for free.
 */
const ORDER = ["system", "light", "dark"] as const;
type Choice = (typeof ORDER)[number];

const LABEL: Record<Choice, string> = {
  system: "Auto",
  light: "Light",
  dark: "Dark",
};

const KEY = "theme";

/** Same-tab writes don't raise `storage`, so the store keeps its own list. */
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): Choice {
  try {
    const stored = localStorage.getItem(KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    // Safari in private mode throws on localStorage; Auto is a fine answer.
    return "system";
  }
}

/** Nothing is stored on the server, so the first paint always says Auto. */
const getServerSnapshot = (): Choice => "system";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const choice = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const next = ORDER[(ORDER.indexOf(choice) + 1) % ORDER.length];

  const apply = () => {
    const root = document.documentElement;
    try {
      if (next === "system") {
        delete root.dataset.theme;
        localStorage.removeItem(KEY);
      } else {
        root.dataset.theme = next;
        localStorage.setItem(KEY, next);
      }
    } catch {
      // Storage refused; the attribute still applies for this page view.
      if (next === "system") delete root.dataset.theme;
      else root.dataset.theme = next;
    }
    listeners.forEach((notify) => notify());
  };

  return (
    <button
      type="button"
      onClick={apply}
      // The visible text is the current state, which reads as a status rather
      // than an action, so the accessible name says what pressing it does.
      aria-label={`Theme: ${LABEL[choice]}. Switch to ${LABEL[next]}`}
      className={`w-fit font-mono tracking-normal text-oxley-700 hover:text-on-surface ${className}`}
    >
      [{LABEL[choice]}]
    </button>
  );
}
