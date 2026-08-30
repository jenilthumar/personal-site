import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";
import { IMAGE_QUALITY, mediaUrl } from "@/lib/media";
import { CaseVideo } from "./CaseVideo";

/**
 * Components for a project case-study body. Text blocks (markdown headings +
 * paragraphs / rich text) sit in a centered 800px column; images placed with
 * <Full> / <Row> break out full-bleed. Authored in the project's MDX body, so
 * text blocks are optional and ordered entirely by the editor.
 *
 * Every block-level mapping carries the site's `reveal`, so a case study
 * sweeps in beat by beat as it's read — a heading and its paragraphs land in
 * the same viewport and stagger; each image in a <Row> reveals as its own
 * column. Inline pieces (links, strong) and the hr ride their block. <Row>
 * itself stays plain so its children stagger instead of moving as a slab.
 */

// Centered reading measure for text — left-aligned within an 800px column.
const MEASURE = "mx-auto w-full max-w-[800px] px-6";

// Section heading, shared by the markdown `##` mapping and <Impact> so the
// band's heading can't drift away from the ones the body writes itself.
const HEADING = `reveal ${MEASURE} mt-24 mb-6 text-[32px] leading-[1.3] font-medium tracking-[-0.01em] text-on-surface`;

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
      className="reveal relative my-24 w-full overflow-hidden bg-oxley-700/10"
      style={{ aspectRatio: cssRatio(aspect) }}
    >
      {src ? (
        <Image
          src={mediaUrl(src)}
          alt={alt}
          fill
          sizes="(min-width: 1920px) 1920px, 100vw"
          quality={IMAGE_QUALITY}
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
    <figure className="reveal flex min-w-0 flex-1 flex-col gap-2">
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
            quality={IMAGE_QUALITY}
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

/**
 * A large single-sentence statement: the question a project set out to answer,
 * or the problem stated in one line. A step above the h2 so it reads as the
 * sentence a section is about rather than a heading for it.
 *
 * Medium, like every other title on the page. It was regular for a while on the
 * theory that the size was doing the work; set against paragraphs that are also
 * regular, it wasn't — the page read as one long block at three sizes. Weight
 * is what separates the things you're meant to skim from the things you read.
 *
 * Held to the reading measure rather than given a width of its own. The page
 * already has two text edges (the measure, and the <Impact> band breaking out
 * past it); a third, 50px off the first, reads as a misalignment rather than a
 * decision. Size and colour are what set this apart, not indentation.
 */
function Lede({ children }: { children?: ReactNode }) {
  return (
    <p
      className={`reveal ${MEASURE} my-24 text-[28px] leading-[1.2] font-medium tracking-[-0.02em] text-oxley-300 sm:text-[40px]`}
    >
      {children}
    </p>
  );
}

/**
 * A figure, set the way the running page sets its figures — mono, medium,
 * `leading-none`, scaling with the window between 24 and 32px. That page is
 * already a page of statistics in this system and its reasoning transfers
 * whole: 18px is too quiet for something meant to be read at a glance, and
 * anything near the <Lede> puts the answers in a shouting match with the
 * question. See the note above FIGURE in app/(site)/running/page.tsx.
 *
 * Tracking is the one departure. That page resets it to normal, because the
 * -0.16px its rows carry is drawn for Inter and only cramps a face that is
 * already monospaced at 18px. This is a display figure at 32px, where the
 * generous advances mono is built with read as slack, so it takes a deliberate
 * -0.03em of its own rather than inheriting Inter's.
 */
const FIGURE =
  "font-mono text-[clamp(1.5rem,2.33vw,2rem)] leading-none font-medium tracking-[-0.03em] text-on-surface";

/**
 * One figure in an <Impact> section: the number, what it measures, and where
 * the number comes from.
 *
 * The number leads and the mono carries it, which is this site's own order for
 * a statistic rather than the detail grid's label-first one. Two earlier passes
 * got this backwards in both directions: an Inter figure at 52px shouted over
 * the lede, and a mono label above the figure put the loudest face on the
 * quietest line and left the number sandwiched between two muted blocks. The
 * label drops to Inter and the basis to mono `text-sm`, so the three lines
 * actually rank.
 *
 * Leading with the figure also retires the subgrid the previous pass needed:
 * the numbers are the first row of every column, so they line up without being
 * told to.
 */
function Stat({
  value,
  label,
  note,
}: {
  value: string;
  label: string;
  /** Where the figure comes from — a baseline, a window, a sample size. */
  note?: string;
}) {
  return (
    <div className="reveal flex flex-col gap-3">
      <span className={FIGURE}>{value}</span>
      <div className="flex flex-col gap-1">
        <span className="text-base leading-[1.3] text-body">{label}</span>
        {note && (
          <span className="font-mono text-sm leading-[1.3] tracking-normal text-oxley-700">
            {note}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * The results section: a heading and the figures under it.
 *
 * Held to the reading measure and headed like every other section, so it reads
 * as part of the case study rather than a band dropped into one. It used to
 * break out to 1160px, which gave the page a third text edge that lined up
 * with nothing.
 *
 * The grid is the running page's stat grid down to the gaps, and like that one
 * it carries no rules between the figures: a 32px mono number over a 16px label
 * has all the contrast it needs, and hairlines around three items read as a
 * table that isn't there.
 */
function Impact({
  label = "Impact",
  children,
}: {
  label?: string;
  children?: ReactNode;
}) {
  return (
    <section>
      <h2 className={HEADING}>{label}</h2>
      <div
        className={`${MEASURE} mb-24 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-x-16`}
      >
        {children}
      </div>
    </section>
  );
}

export const projectMdxComponents: MDXComponents = {
  Full,
  Lede,
  Impact,
  Stat,
  // CaseVideo owns its playback and takes no className, so the reveal rides a
  // wrapper. Block-level with no margins of its own, the video's my-24
  // collapses straight through it — the spacing doesn't know it's there.
  Video: (props: ComponentPropsWithoutRef<typeof CaseVideo>) => (
    <div className="reveal">
      <CaseVideo {...props} />
    </div>
  ),
  Row,
  Img,
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2 className={HEADING} {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3
      className={`reveal ${MEASURE} mt-16 mb-4 text-xl leading-[1.3] font-medium text-on-surface`}
      {...props}
    />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p
      className={`reveal ${MEASURE} mb-4 text-base leading-[1.3] text-body`}
      {...props}
    />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className={`reveal mx-auto mb-4 w-full max-w-[800px] list-disc space-y-2 pr-6 pl-11 text-base leading-[1.3] text-body marker:text-oxley-700`}
      {...props}
    />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className={`reveal mx-auto mb-4 w-full max-w-[800px] list-decimal space-y-2 pr-6 pl-11 text-base leading-[1.3] text-body marker:text-oxley-700`}
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
      className={`reveal ${MEASURE} my-6 border-l border-oxley-700 pl-4 text-body italic`}
      {...props}
    />
  ),
  hr: () => (
    <hr className={`${MEASURE} my-12 border-0 border-t border-oxley-700/40`} />
  ),
};
