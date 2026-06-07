import Image from "next/image";
import Link from "next/link";
import { getWorkByCategory, type WorkItem } from "@/lib/content";
import { mediaUrl } from "@/lib/media";
import { site } from "@/lib/site";

function IndexSection({ title, items }: { title: string; items: WorkItem[] }) {
  if (!items.length) return null;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-medium tracking-[-0.01em] text-oxley-300">{title}</h2>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/work/${item.slug}`}
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

export function Sidebar() {
  const projects = getWorkByCategory("project");
  const photography = getWorkByCategory("photography");

  return (
    <aside className="flex shrink-0 flex-col justify-between gap-12 text-base leading-[1.3] lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-[336px] lg:gap-0 lg:overflow-y-auto">
      <div className="flex flex-col gap-8">
        {/* Name */}
        <Link
          href="/"
          className="inline-flex items-start self-start font-medium text-oxley-300"
        >
          {site.name}
          {site.registered && (
            <span className="ml-0.5 align-super text-[0.6em]">®</span>
          )}
        </Link>

        {/* Bio */}
        <p className="text-on-surface">{site.bio}</p>

        {/* Currently designing at */}
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-on-surface">
            <span>{site.current.label}</span>
            <a
              href={site.current.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-colors hover:text-oxley-300"
            >
              <span className="relative inline-block size-5 shrink-0 overflow-hidden bg-on-surface">
                <Image
                  src={mediaUrl(site.current.logo)}
                  alt={`${site.current.company} logo`}
                  fill
                  sizes="20px"
                  className="object-cover [mix-blend-mode:plus-lighter]"
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
    </aside>
  );
}
