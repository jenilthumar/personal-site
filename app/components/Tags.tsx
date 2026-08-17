import { Fragment } from "react";

/**
 * Renders a list of tags separated by a "∙" bullet, in the dimmed token and
 * the mono — matches the Figma card meta row and is reused on the work detail
 * header.
 */
export function Tags({
  tags,
  className = "",
}: {
  tags: string[];
  className?: string;
}) {
  if (!tags.length) return null;

  return (
    <span
      className={`flex items-center gap-2 font-mono tracking-normal text-oxley-700 ${className}`}
    >
      {tags.map((tag, index) => (
        <Fragment key={tag}>
          {index > 0 && <span aria-hidden="true">∙</span>}
          <span>{tag}</span>
        </Fragment>
      ))}
    </span>
  );
}
