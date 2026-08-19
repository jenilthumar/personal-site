"use client";

import { useEffect, useSyncExternalStore } from "react";

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
 * the theme in one tab settles every other open tab.
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

/**
 * Where the choice lives once storage has refused to take it. Safari in private
 * mode is the case: `getItem` answers, `setItem` throws, so a read-only check
 * doesn't catch it. Without this the snapshot would keep reporting whatever was
 * stored before — Auto, for anyone who never chose — and the cycle would pick
 * light every single click while the label sat unmoved. Null until a write
 * actually fails, so the normal path never touches it.
 */
let memory: Choice | null = null;

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): Choice {
  if (memory) return memory;
  try {
    const stored = localStorage.getItem(KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    // Storage is gone entirely; Auto is a fine answer until something is picked.
    return "system";
  }
}

/** Nothing is stored on the server, so the first paint always says Auto. */
const getServerSnapshot = (): Choice => "system";

/** Auto is the absence of the attribute, so system deletes rather than sets. */
function paint(choice: Choice) {
  const root = document.documentElement;
  if (choice === "system") delete root.dataset.theme;
  else root.dataset.theme = choice;
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const choice = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const next = ORDER[(ORDER.indexOf(choice) + 1) % ORDER.length];

  // The snapshot is the one source of truth for what's on screen, which is what
  // makes the cross-tab case work: a `storage` event moves `choice` in a tab
  // nobody clicked, and the palette has to follow it there too. The click path
  // paints ahead of this so the change isn't a frame late where it's watched.
  useEffect(() => {
    paint(choice);
  }, [choice]);

  const apply = () => {
    paint(next);
    try {
      if (next === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch {
      memory = next;
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
