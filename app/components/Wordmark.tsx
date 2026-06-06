import Link from "next/link";
import { site } from "@/lib/site";

/** The "Jenil HT®" mark, linking home. Callers add positioning / blend classes. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-start font-medium text-oxley-300 ${className}`}
    >
      {site.name}
      {site.registered && (
        <span className="ml-0.5 align-super text-[0.6em]">®</span>
      )}
    </Link>
  );
}
