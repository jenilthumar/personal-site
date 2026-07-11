/**
 * A script that runs synchronously during HTML parsing, before first paint —
 * for correcting server-rendered DOM from client-only state (localStorage)
 * without a flash. On client-side navigations React renders the right state
 * directly, so the script ships inert (`text/plain`) and never re-runs.
 * Pattern from the Next.js "preventing flash before hydration" guide.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
