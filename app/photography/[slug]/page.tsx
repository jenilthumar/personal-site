import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWorkByCategory, getWorkBySlug, getNextWork } from "@/lib/content";
import { PhotographyView } from "@/app/components/PhotographyView";

// Only photography slugs resolve — fully prerendered, everything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return getWorkByCategory("photography").map((item) => ({ slug: item.slug }));
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

export default async function PhotographyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getWorkBySlug(slug);
  if (!item || item.category !== "photography") notFound();

  const next = getNextWork(slug);

  return <PhotographyView item={item} next={next} />;
}
