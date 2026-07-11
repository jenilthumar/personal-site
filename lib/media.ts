/**
 * Resolves a media path to its delivery URL.
 *
 * - Absolute URLs (http/https) pass through unchanged.
 * - Everything else resolves to the Vercel Blob public store. The base comes
 *   from NEXT_PUBLIC_MEDIA_BASE_URL when set (e.g. a custom domain), and
 *   otherwise defaults to the known public store below — so prerendered pages
 *   still resolve to Blob in environments where the env var isn't configured.
 *   The old `public/` copies were removed when media moved to Blob, so there's
 *   no local fallback to fall back to.
 *
 * Frontmatter / config store clean relative paths like "work/opera-group.png"
 * (a leading slash is fine too — it's normalized).
 */
const DEFAULT_BASE = "https://3b29fc7jhxjz1pga.public.blob.vercel-storage.com";
const MEDIA_BASE =
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(/\/+$/, "") || DEFAULT_BASE;

export function mediaUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.replace(/^\/+/, "");
  return `${MEDIA_BASE}/${clean}`;
}

/**
 * next/image quality floor for the whole site — above Next's default of 75.
 * Photography, where the image is the point, gets the full 100. Both values
 * must be listed in `images.qualities` in next.config.ts, or the optimizer
 * rejects them.
 */
export const IMAGE_QUALITY = 90;
export const PHOTO_QUALITY = 100;
