import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getAllWork, getWorkBySlug, getNextWork } from "@/lib/content";
import { ProjectView } from "@/app/components/ProjectView";

// Only slugs from generateStaticParams resolve — fully prerendered, unknown 404s.
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
    description: item.description ?? item.summary,
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

  // Photography moved to /photography/<slug>; keep old links working.
  if (item.category === "photography") redirect(`/photography/${slug}`);

  const next = getNextWork(slug);

  // The case-study body lives in the project's MDX (remark-frontmatter strips
  // the YAML); rendered with project components in ProjectView.
  const Post = item.hasBody
    ? (await import(`@/content/${slug}.mdx`)).default
    : null;

  return <ProjectView item={item} next={next} Post={Post} />;
}
