import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllWork, getWorkBySlug, getNextWork } from "@/lib/content";
import { ProjectView } from "@/app/components/ProjectView";
import { PhotographyView } from "@/app/components/PhotographyView";

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

  const next = getNextWork(slug);

  return item.category === "photography" ? (
    <PhotographyView item={item} next={next} />
  ) : (
    <ProjectView item={item} next={next} />
  );
}
