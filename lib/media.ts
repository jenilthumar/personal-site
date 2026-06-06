/**
 * Resolves a media path to its delivery URL.
 *
 * - Absolute URLs (http/https) pass through unchanged.
 * - When NEXT_PUBLIC_MEDIA_BASE_URL is set (the Cloudflare R2 public bucket URL
 *   or a custom domain), media is served from there — optimized by next/image.
 * - Otherwise it falls back to the local `public/` path, so the site keeps
 *   working in development before R2 is connected.
 *
 * Frontmatter / config store clean relative paths like "work/opera-group.png"
 * (a leading slash is fine too — it's normalized).
 */
const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(/\/+$/, "");

export function mediaUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.replace(/^\/+/, "");
  return MEDIA_BASE ? `${MEDIA_BASE}/${clean}` : `/${clean}`;
}
