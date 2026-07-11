"use client";

import Link from "next/link";
import type { FeedProject } from "@/lib/content";

/**
 * The project index for the scroll feed, shown on the left of the top toolbar.
 * The project in view reads out as [n Title · tags]; the rest collapse to their
 * number and jump the feed there on click. "Project Info +" links to the case
 * study of whichever project is in view.
 */
export function FeedIndex({
  projects,
  active,
  jumpTo,
}: {
  projects: FeedProject[];
  active: number;
  jumpTo: (index: number) => void;
}) {
  const current = projects[active] ?? projects[0];
  if (!current) return null;

  return (
    <nav
      aria-label="Project index"
      className="flex min-w-0 items-baseline gap-4 sm:gap-6"
    >
      <Link
        href={current.href}
        className="hidden shrink-0 text-on-surface transition-colors hover:text-oxley-300 sm:inline"
      >
        Project Info +
      </Link>

      <div className="flex min-w-0 items-baseline gap-3 sm:gap-4">
        {projects.map((project, index) => (
          <button
            key={project.slug}
            type="button"
            onClick={() => jumpTo(index)}
            aria-current={index === active ? "true" : undefined}
            className={
              index === active
                ? "min-w-0 truncate text-oxley-300"
                : "shrink-0 text-oxley-700 transition-colors hover:text-oxley-300"
            }
          >
            {index === active ? (
              <>
                [{index + 1} {project.title}
                {project.tags.length > 0 && (
                  <span className="text-oxley-700 max-sm:hidden">
                    {" "}
                    ∙ {project.tags.join(" ∙ ")}
                  </span>
                )}
                ]
              </>
            ) : (
              <>[{index + 1}]</>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
