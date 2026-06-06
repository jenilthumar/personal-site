import type { ReactNode } from "react";
import type { WorkItem } from "@/lib/content";

/** Builds the detail grid, omitting any field that isn't provided. */
function buildDetails(item: WorkItem): { label: string; value: ReactNode }[] {
  const details: { label: string; value: ReactNode }[] = [];

  if (item.sectors) details.push({ label: "Sectors", value: item.sectors });

  const services = item.services ?? (item.tags.length ? item.tags.join(", ") : undefined);
  if (services) details.push({ label: "Services", value: services });

  if (item.url) {
    const host = item.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
    details.push({
      label: "Visit",
      value: (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-oxley-700/50 underline-offset-2 transition-colors hover:text-oxley-300"
        >
          {host}
        </a>
      ),
    });
  }

  if (item.timeline) details.push({ label: "Timeline", value: item.timeline });

  const client = item.client ?? item.company;
  if (client) details.push({ label: "Client", value: client });

  return details;
}

export function ProjectSummary({ item }: { item: WorkItem }) {
  const details = buildDetails(item);
  const description = item.description ?? item.summary;

  return (
    <section className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
      <div className="flex max-w-[480px] flex-col gap-4">
        <h1 className="text-[32px] leading-[1.3] text-on-surface">{item.title}</h1>
        {description && (
          <p className="text-base leading-[1.3] text-on-surface">{description}</p>
        )}
      </div>

      {details.length > 0 && (
        <dl className="flex flex-wrap gap-x-12 gap-y-5 lg:w-[389px] lg:shrink-0">
          {details.map((detail) => (
            <div key={detail.label} className="flex shrink-0 flex-col gap-2">
              <dt className="text-base leading-[1.3] text-oxley-700">
                {detail.label}
              </dt>
              <dd className="whitespace-nowrap text-base leading-[1.3] text-on-surface">
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
