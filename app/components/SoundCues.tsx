"use client";

import { useEffect } from "react";
import { bind } from "cuelume";
import { applyStoredSound } from "./sound";

/**
 * Turns the cues on. Mounted once, in the root layout, above every page.
 *
 * `bind()` is a pair of delegated listeners on the document, so it covers the
 * `data-cuelume-*` attributes in markup that doesn't exist yet — which is all
 * of it after a client-side navigation. It never needs re-running, and calling
 * it twice is a no-op anyway.
 *
 * It runs in an effect rather than at module scope so the stored mute is
 * applied first: cuelume's enabled flag is module-global, and a cue fired
 * between binding and reading storage would be a cue a muted reader asked not
 * to hear. Nothing can fire before an effect runs, since nothing here plays
 * without a pointer or a key.
 */
export function SoundCues() {
  useEffect(() => {
    applyStoredSound();
    bind();
  }, []);

  return null;
}
