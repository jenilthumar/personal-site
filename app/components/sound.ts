"use client";

import { setEnabled } from "cuelume";

/**
 * The mute preference, and the only thing on the site that decides whether a
 * cue is heard.
 *
 * Same shape as the theme store in ThemeToggle: a value in localStorage, a set
 * of listeners because a same-tab write never raises `storage`, and a memory
 * fallback for the browsers that answer `getItem` and then throw on `setItem`.
 * What differs is the default. A theme has no right answer until the OS is
 * asked, so nothing is stored until the switch is touched; sound has one, and
 * it is on. A palette of cues nobody hears until they hunt for a switch is a
 * palette nobody hears.
 *
 * That is only defensible because cuelume already refuses the rude case:
 * `play()` returns early while `navigator.userActivation.hasBeenActive` is
 * false, so the first sound anyone gets is one they caused by clicking, and a
 * page opened in a background tab stays silent whatever is stored here.
 */
const KEY = "sound";

const listeners = new Set<() => void>();

/** Where the choice goes once storage has refused to take it. See ThemeToggle. */
let memory: boolean | null = null;

export function subscribeSound(onChange: () => void) {
  listeners.add(onChange);
  // Another tab's write, so two open tabs agree about the switch.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** On unless something has explicitly said otherwise. */
export function readSound(): boolean {
  if (memory !== null) return memory;
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

/** The server has no storage to read, and the default is the same either way. */
export const soundServerSnapshot = () => true;

export function writeSound(on: boolean) {
  setEnabled(on);
  applyAttribute(on);
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    memory = on;
  }
  listeners.forEach((notify) => notify());
}

/**
 * `data-sound` on <html> is what draws the switch, not React state — the same
 * trick the theme mark uses. The inline script in the root layout writes it
 * before first paint, so a muted reader never sees the bars stand up and then
 * drop on hydration.
 */
export function applyAttribute(on: boolean) {
  const root = document.documentElement;
  if (on) delete root.dataset.sound;
  else root.dataset.sound = "off";
}

/** Run once per load, before the first cue can fire. */
export function applyStoredSound() {
  const on = readSound();
  setEnabled(on);
  applyAttribute(on);
}
