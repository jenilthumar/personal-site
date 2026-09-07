import type { ReactNode } from "react";
import type { WorkItem } from "@/lib/content";

/** Builds the detail grid, omitting any field that isn't provided. */
function buildDetails(item: WorkItem): { label: string; value: ReactNode }[] {
  const details: { label: string; value: ReactNode }[] = [];

  // Role leads: on a portfolio the reader is sizing up the person before the
  // client, and it's the field a hiring manager scans for first.
  if (item.role) details.push({ label: "Role", value: item.role });
  if (item.team) details.push({ label: "Team", value: item.team });
  if (item.sectors) details.push({ label: "Sectors", value: item.sectors });
  if (item.services) details.push({ label: "Services", value: item.services });
  if (item.timeline) details.push({ label: "Timeline", value: item.timeline });

  const client = item.client ?? item.company;
  if (client) details.push({ label: "Client", value: client });

  return details;
}

export function ProjectSummary({ item }: { item: WorkItem }) {
  const details = buildDetails(item);
  const description = item.description ?? item.summary;

  return (
    // The two halves reveal separately rather than the section as one: both
    // are on screen when a case study opens, so they cascade 0/1 under the
    // hero — which has no reveal of its own; the morph (or, on a hard load,
    // simply being the LCP) is its entrance.
    <section className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
      <div className="reveal flex max-w-[480px] flex-col gap-4">
        <h1 className="font-display text-[32px] leading-[1.3] font-medium tracking-[-0.01em] text-on-surface">
          {item.title}
        </h1>
        {description && (
          <p className="text-base leading-[1.3] text-body">{description}</p>
        )}
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            // The one link on a case study that leaves the site, so it gets the
            // same tick every other destination gets. No cue on the click:
            // going somewhere is the site's quietest act, and a sound on the
            // way out would be the last thing heard from a page the reader is
            // already leaving.
            data-cuelume-hover="tick"
            className="group/visit mt-1 inline-flex w-fit items-center gap-1.5 text-base leading-[1.3] font-medium text-oxley-300 underline decoration-oxley-700 underline-offset-4 transition-colors hover:decoration-oxley-300"
          >
            Visit live
            <svg
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
              className="size-3 transition-transform duration-200 ease-out-quart group-hover/visit:translate-x-0.5 group-hover/visit:-translate-y-0.5"
            >
              <path
                d="M3.5 8.5L8.5 3.5M4.5 3.5H8.5V7.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        )}
      </div>

      {details.length > 0 && (
        <dl className="reveal grid grid-cols-2 gap-x-12 gap-y-5 lg:w-[416px] lg:shrink-0">
          {details.map((detail) => (
            <div key={detail.label} className="flex min-w-0 flex-col gap-2">
              {/* Field names take the mono, values keep Inter: the left
                  column is a form of labelling, the right is a client's name or
                  a service written out. */}
              <dt className="font-mono text-base leading-[1.3] text-oxley-700">
                {detail.label}
              </dt>
              <dd className="text-base leading-[1.3] break-words text-body">
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
