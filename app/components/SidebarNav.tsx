"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IMAGE_QUALITY, mediaUrl } from "@/lib/media";
import { site } from "@/lib/site";

export type SidebarItem = { slug: string; title: string; href: string };

function IndexSection({
  title,
  items,
}: {
  title: string;
  items: SidebarItem[];
}) {
  if (!items.length) return null;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-medium tracking-[-0.01em] text-oxley-300">{title}</h2>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={item.href}
              className="text-on-surface transition-colors hover:text-oxley-300"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * On the home page the sidebar *is* the landing, so it stays fully expanded.
 * On every other page it collapses to the name + a toggle on mobile (JS-free
 * checkbox disclosure) so the page content leads; desktop is unchanged either
 * way.
 */
export function SidebarNav({
  projects,
  photography,
}: {
  projects: SidebarItem[];
  photography: SidebarItem[];
}) {
  const pathname = usePathname();
  const expanded = pathname === "/";
  const dimOnMobile = expanded ? "" : "max-lg:hidden";

  return (
    <aside className="relative flex shrink-0 flex-col text-base leading-[1.3] lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-[336px] lg:overflow-y-auto">
      {!expanded && (
        // key by route so the checkbox remounts (and closes) on navigation —
        // the shared layout otherwise keeps it checked across pages.
        <input
          key={pathname}
          id="site-menu"
          type="checkbox"
          aria-label="Toggle menu"
          className="peer sr-only"
        />
      )}

      {/* Top bar: name + (mobile-only) toggle */}
      <div
        className={`flex items-center justify-between gap-4 ${
          expanded ? "" : "peer-checked:[&_svg]:rotate-45"
        }`}
      >
        <Link
          href="/"
          className="inline-flex items-start font-medium text-oxley-300"
        >
          {site.name}
          {site.registered && (
            <span className="ml-0.5 align-super text-[0.6em]">®</span>
          )}
        </Link>

        {!expanded && (
          <label
            htmlFor="site-menu"
            aria-hidden="true"
            className="grid size-7 shrink-0 cursor-pointer place-items-center text-oxley-700 transition-[color,scale] duration-150 ease-out-quart hover:text-oxley-300 peer-focus-visible:text-oxley-300 active:scale-90 active:duration-0 lg:hidden"
          >
            <span className="grid size-5 place-items-center border border-current">
              <svg
                viewBox="0 0 12 12"
                fill="none"
                className="size-2.5 transition-transform duration-200 ease-out-quart"
              >
                <path
                  d="M6 1.5v9M1.5 6h9"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </label>
        )}
      </div>

      {/* Panel — always open when expanded and on desktop. The mobile menu
          eases open by growing its grid row 0fr → 1fr with a fade; reduced
          motion keeps only the fade. */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out-quart motion-reduce:transition-[opacity] lg:grow lg:grid-rows-[1fr] lg:opacity-100 ${
          expanded
            ? "grid-rows-[1fr]"
            : "grid-rows-[0fr] opacity-0 peer-checked:grid-rows-[1fr] peer-checked:opacity-100"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-12 pt-8 lg:h-full lg:justify-between lg:gap-0">
            <div className="flex flex-col gap-8">
              {/* Bio — identity, so it sits out of the mobile menu */}
              <p className={`text-on-surface ${dimOnMobile}`}>{site.bio}</p>

              {/* Currently designing at … */}
              <div className={`flex flex-col gap-1 ${dimOnMobile}`}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-on-surface">
                  <span>{site.current.label}</span>
                  <a
                    href={site.current.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 transition-colors hover:text-oxley-300"
                  >
                    <span className="relative inline-block size-5 shrink-0 translate-y-[2px] overflow-hidden bg-on-surface">
                      <Image
                        src={mediaUrl(site.current.logo)}
                        alt={`${site.current.company} logo`}
                        fill
                        sizes="20px"
                        quality={IMAGE_QUALITY}
                        className="object-contain grayscale"
                      />
                    </span>
                    <span>{site.current.company}</span>
                  </a>
                </div>
                <p className="text-oxley-700">{site.dateRange}</p>
              </div>

              {/* Index of work */}
              <IndexSection title="Projects" items={projects} />
              <IndexSection title="Photography" items={photography} />
            </div>

            {/* Footer navigation */}
            <nav className="flex flex-col gap-2 font-medium tracking-[-0.01em] text-oxley-300">
              {site.footerNav.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="w-fit transition-opacity hover:opacity-70"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
}
