// React's <ViewTransition> ships in the build Next bundles for App Router, but
// its types live in the canary channel and aren't loaded by default. tsconfig
// has no "types" array to add it to, and next-env.d.ts isn't ours to edit, so
// the reference lives here.
/// <reference types="react/canary" />
