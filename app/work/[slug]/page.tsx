import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllWork, getWorkBySlug } from "@/lib/content";
import { Tags } from "@/app/components/Tags";

// Only slugs returned by generateStaticParams resolve — everything is
// prerendered at build time and unknown paths 404 (no on-demand rendering).
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllWork().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getWorkBySlug(slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.summary,
  };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getWorkBySlug(slug);
  if (!item) notFound();

  // remark-frontmatter (configured in next.config.ts) strips the YAML block,
  // so only the authored body renders here.
  const { default: Post } = await import(`@/content/${slug}.mdx`);

  return (
    <article className="flex flex-col gap-8 pb-24">
      <Link
        href="/"
        className="w-fit text-base text-oxley-700 transition-colors hover:text-oxley-300"
      >
        ← Index
      </Link>

      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
          <h1 className="text-2xl font-medium tracking-[-0.01em] text-oxley-300">
            {item.title}
          </h1>
          <Tags tags={item.tags} className="shrink-0 whitespace-nowrap" />
        </div>

        {item.summary && (
          <p className="max-w-2xl text-on-surface">{item.summary}</p>
        )}

        {(item.company || item.url) && (
          <div className="flex flex-wrap items-center gap-x-3 text-oxley-700">
            {item.company && <span>{item.company}</span>}
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-oxley-700/50 underline-offset-2 transition-colors hover:text-oxley-300"
              >
                Visit site ↗
              </a>
            )}
          </div>
        )}
      </header>

      {item.cover && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-oxley-700/10">
          <Image
            src={item.cover}
            alt={item.title}
            fill
            sizes="(min-width: 1024px) calc(100vw - 480px), 100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="max-w-2xl">
        <Post />
      </div>
    </article>
  );
}
