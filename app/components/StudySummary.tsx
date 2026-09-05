import type { ReactNode } from "react";
import type { WorkItem } from "@/lib/content";

/**
 * The head of a study-format case study: what it is, then the facts about it.
 *
 * The showcase format puts the same material in two columns side by side,
 * which works because a reader there is about to start scrolling images. A
 * study is a document, so this is ordered the way a document is: masthead,
 * standfirst, then a spec strip ruled off from both.
 *
 * The strip is the one piece drawn differently from ProjectSummary's grid: a
 * row rather than a column, because a hiring manager scans role, how long and
 * who else in one pass rather than hunting for them down a list. It was ruled
 * off above and below for a while, on the theory that a spec sheet wants to
 * look like one. It doesn't need to. The mono labels already say these are
 * fields, and the rules only added two more lines to a page that had six of
 * them at the section breaks.
 */
function buildDetails(item: WorkItem): { label: string; value: ReactNode }[] {
  const details: { label: string; value: ReactNode }[] = [];

  // Role leads for the same reason it does on the showcase: on a portfolio the
  // reader is sizing up the person before the client.
  if (item.role) details.push({ label: "Role", value: item.role });
  if (item.timeline) details.push({ label: "Timeline", value: item.timeline });
  if (item.team) details.push({ label: "Team", value: item.team });

  const client = item.client ?? item.company;
  if (client) details.push({ label: "Client", value: client });
  if (item.sectors) details.push({ label: "Sector", value: item.sectors });

  return details;
}

export function StudySummary({ item }: { item: WorkItem }) {
  const details = buildDetails(item);
  const description = item.description ?? item.summary;
  const eyebrow = item.services ?? item.tags[0];

  return (
    <header className="flex flex-col gap-10">
      <div className="reveal flex flex-col gap-4">
        {eyebrow && (
          // Same caps mono as the section labels below it. Two eyebrow styles
          // on one page is two systems; the discipline naming the whole study
          // and the labels naming its parts are the same kind of thing.
          <p className="font-mono text-base leading-[1.3] text-oxley-700 uppercase">
            {eyebrow}
          </p>
        )}
        {/* The biggest type on any inner page, and the only place it's earned:
            a study opens on its own name with nothing else on the screen
            competing. The showcase's 32px title sits beside a detail grid and
            can't take this much room. */}
        <h1 className="max-w-[900px] font-display text-[40px] leading-[1.1] font-medium tracking-[-0.02em] text-on-surface sm:text-[56px]">
          {item.title}
        </h1>
        {description && (
          // The standfirst: a step above running copy, on the same measure as
          // it, so the eye starts here and then settles into the body size
          // without the column moving.
          <p className="max-w-[620px] text-lg leading-[1.55] text-body sm:text-xl">
            {description}
          </p>
        )}
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
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
        // Runs the full column rather than the reading measure. It isn't
        // reading — it's a strip of facts, and it wants to be one line of them
        // on a wide window and two on a narrow one.
        <dl className="reveal grid grid-cols-2 gap-x-10 gap-y-6 sm:grid-cols-[repeat(auto-fit,minmax(160px,1fr))]">
          {details.map((detail) => (
            <div key={detail.label} className="flex min-w-0 flex-col gap-1.5">
              <dt className="font-mono text-sm leading-[1.3] text-oxley-700">
                {detail.label}
              </dt>
              <dd className="text-base leading-[1.4] break-words text-body">
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </header>
  );
}
