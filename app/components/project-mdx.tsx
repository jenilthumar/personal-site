import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";
import { mediaUrl } from "@/lib/media";
import { CaseVideo } from "./CaseVideo";

/**
 * Components for a project case-study body. Text blocks (markdown headings +
 * paragraphs / rich text) sit in a centered 800px column; images placed with
 * <Full> / <Row> break out full-bleed. Authored in the project's MDX body, so
 * text blocks are optional and ordered entirely by the editor.
 */

// Centered reading measure for text — left-aligned within an 800px column.
const MEASURE = "mx-auto w-full max-w-[800px] px-6";

const cssRatio = (aspect = "16/9") => aspect.replace("/", " / ");

function Placeholder() {
  return (
    <div className="h-full w-full bg-gradient-to-br from-oxley-700/25 via-oxley-700/10 to-transparent" />
  );
}

/** Full-bleed image (or placeholder) at the given aspect ratio. */
function Full({
  src,
  alt = "",
  aspect = "16/9",
}: {
  src?: string;
  alt?: string;
  aspect?: string;
}) {
  return (
    <div
      className="relative my-24 w-full overflow-hidden bg-oxley-700/10"
      style={{ aspectRatio: cssRatio(aspect) }}
    >
      {src ? (
        <Image
          src={mediaUrl(src)}
          alt={alt}
          fill
          sizes="(min-width: 1920px) 1920px, 100vw"
          className="object-cover"
        />
      ) : (
        <Placeholder />
      )}
    </div>
  );
}

/** One image within a <Row> (equal-width column at its aspect), optional caption. */
function Img({
  src,
  alt = "",
  aspect = "3/2",
  caption,
}: {
  src?: string;
  alt?: string;
  aspect?: string;
  caption?: string;
}) {
  return (
    <figure className="flex min-w-0 flex-1 flex-col gap-2">
      <div
        className="relative w-full overflow-hidden bg-oxley-700/10"
        style={{ aspectRatio: cssRatio(aspect) }}
      >
        {src ? (
          <Image
            src={mediaUrl(src)}
            alt={alt || caption || ""}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <Placeholder />
        )}
      </div>
      {caption && (
        <figcaption className="text-base leading-[1.3] text-oxley-700">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** A row of side-by-side images with a 24px gap; stacks on mobile. */
function Row({ children }: { children?: ReactNode }) {
  return (
    <div className="my-24 flex flex-col gap-6 sm:flex-row sm:items-start">
      {children}
    </div>
  );
}

export const projectMdxComponents: MDXComponents = {
  Full,
  Video: CaseVideo,
  Row,
  Img,
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className={`${MEASURE} mt-24 mb-6 text-[32px] leading-[1.3] text-on-surface`}
      {...props}
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3
      className={`${MEASURE} mt-16 mb-4 text-xl leading-[1.3] text-on-surface`}
      {...props}
    />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p
      className={`${MEASURE} mb-4 text-base leading-[1.3] text-on-surface`}
      {...props}
    />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className={`mx-auto mb-4 w-full max-w-[800px] list-disc space-y-2 pr-6 pl-11 text-base leading-[1.3] text-on-surface marker:text-oxley-700`}
      {...props}
    />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className={`mx-auto mb-4 w-full max-w-[800px] list-decimal space-y-2 pr-6 pl-11 text-base leading-[1.3] text-on-surface marker:text-oxley-700`}
      {...props}
    />
  ),
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-medium text-oxley-300" {...props} />
  ),
  a: ({ href = "#", ...props }: ComponentPropsWithoutRef<"a">) => {
    const className =
      "text-oxley-300 underline decoration-oxley-700 underline-offset-[3px] transition-colors hover:decoration-oxley-300";
    return href.startsWith("http") ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        {...props}
      />
    ) : (
      <Link href={href} className={className} {...props} />
    );
  },
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className={`${MEASURE} my-6 border-l border-oxley-700 pl-4 text-on-surface italic`}
      {...props}
    />
  ),
  hr: () => (
    <hr className={`${MEASURE} my-12 border-0 border-t border-oxley-700/40`} />
  ),
};
