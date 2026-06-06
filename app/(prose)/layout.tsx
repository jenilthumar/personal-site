/**
 * Shared shell for the standalone MDX pages (About / Explorations / Contact).
 * Constrains content to a comfortable reading measure; the route group `(prose)`
 * keeps these URLs at the root (/about, /explorations, /contact).
 */
export default function ProseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <article className="max-w-2xl pb-24">{children}</article>;
}
