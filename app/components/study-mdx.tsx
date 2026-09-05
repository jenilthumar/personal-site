import { isValidElement, type ComponentPropsWithoutRef, type ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";
import { sectionId } from "@/lib/content";
import { IMAGE_QUALITY, mediaUrl } from "@/lib/media";
import { CaseVideo } from "./CaseVideo";
import { cssRatio, Placeholder } from "./media-parts";

/**
 * Components for a study-format case-study body — product work, where the
 * argument is the reasoning and the screens are evidence for it. The showcase
 * format in project-mdx.tsx is the other half of the pair; see the WorkFormat
 * note in lib/content.ts for which work goes where.
 *
 * Three things are different here and everything else follows from them.
 *
 * **One left edge, two widths.** Prose sits on a 620px measure and media runs
 * the full column beside the rail, both starting at the same x. The showcase
 * centres its 800px measure and breaks media out to the window, which is right
 * when the images are the subject; here they're support, and support that
 * escapes the page every time interrupts the read. The measure is the tighter
 * of the two on purpose — about 76 characters against the showcase's 100 —
 * because these paragraphs run six and eight lines rather than two, and a line
 * that long is one the eye loses its place returning from.
 *
 * **Air inside the paragraph, not just around it.** Running copy is set at
 * 1.6 rather than the 1.3 the rest of the site uses. 1.3 is right for a caption
 * or a two-line blurb and wrong for a page someone is going to read for eight
 * minutes.
 *
 * **Three spacings, ranked.** 20px inside a thought, 56px between a block and
 * the media supporting it, 128px and a rule between sections. The showcase
 * uses 96px for everything below a heading, which reads as evenly-spaced
 * material rather than as material with a shape.
 *
 * Every block carries the site's `reveal`, as in the showcase.
 */

/** The reading measure. Left-aligned — media shares this left edge and simply
 *  runs further right. */
const TEXT = "max-w-[620px]";

/** Running copy, and anything that has to match it. */
const BODY = `text-base leading-[1.6] text-body`;

/**
 * Section heading. The mono label, not the big line under it — see the note on
 * <Lede>. `scroll-mt` keeps a jumped-to heading off the top edge.
 *
 * Set in caps at the body size, and separated by space alone. It used to carry
 * a rule across the full column, which at six sections was six full-width
 * hairlines in a page that already ranks its material by size and colour —
 * they read as a form. Space does the same job without drawing anything, so
 * the gap above went from 152px to 160 and the label had to get loud enough to
 * hold the break on its own: caps at 16px, where it was sentence case at 14.
 *
 * 160 only from `sm`. A section break has to out-measure everything inside the
 * section, and on a 1088px column the largest thing inside is a 56px gap
 * around a figure, so 160 is a comfortable third above it. On a phone the
 * column is a third of the width and the same 160px is most of a screen of
 * nothing between a caption and the next heading — the break stops reading as
 * a break and starts reading as the end of the page. 96 keeps the same ratio
 * against the blocks it separates at the size those blocks actually are.
 *
 * It printed a `01`, `02` off a CSS counter for a while, in step with the same
 * numbers on the rail. Both are gone. The counter was bookkeeping the reader
 * never asked for: what a section break has to say is which section, and the
 * rail's own current-item state and progress ring already answer how far in.
 */
const SECTION =
  "reveal mt-24 mb-6 flex scroll-mt-24 items-baseline gap-3 font-mono text-base leading-[1.3] text-oxley-700 uppercase first:mt-0 sm:mt-40";

/** Flattens a heading's children to the text the anchor is named after. */
function childText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(childText).join("");
  if (isValidElement(node)) {
    return childText((node.props as { children?: ReactNode }).children);
  }
  return "";
}

/**
 * The line a section is actually about — the finding, not the filing.
 *
 * The `##` above it names the section and stays small: it's the label the rail
 * points at, and a reader who has just clicked "Research" doesn't need the
 * word Research at 36px. What they need is the sentence that section exists to
 * deliver, which is this. Ink rather than the emphasis token, because at this
 * size and weight it's already the loudest thing on the screen and the
 * emphasis token is spent on links and the rail's live value.
 */
function Lede({ children }: { children?: ReactNode }) {
  return (
    <p
      className={`reveal ${TEXT} mb-8 text-[28px] leading-[1.2] font-medium tracking-[-0.02em] text-on-surface sm:text-[36px]`}
    >
      {children}
    </p>
  );
}

/**
 * A supporting image: column width, with a title and caption under it.
 *
 * This is the study format's default way to show a screen, and the difference
 * from the showcase's <Full> is the whole point of the format. A <Full> is a
 * frame the reader stops at; a <Figure> is a sentence's evidence, sitting in
 * the column that sentence is in, at the width that column allows.
 *
 * `title` is for a screen that is doing something nameable — a flow, a state,
 * a before. With only a caption it stays a caption: mono and muted, the way
 * the rest of the site labels a picture.
 *
 * `width="text"` drops it onto the reading measure. That's for a portrait
 * screenshot, which at the column's full 1088px would stand over a metre tall
 * on the page and stop being evidence for a sentence — it becomes the thing
 * the sentence is a caption for, which is the showcase's job, not this one.
 *
 * There is no third, wider setting, and the reason is the rail. A block that
 * reclaims the rail's 264px is a block that paints over it: the rail is
 * sticky, so it's beside the column at every scroll position, and the two are
 * siblings in the positioned layer with the column later in the DOM. The
 * navigation blinks out every time a picture goes past. Anything that wants
 * the window more than it wants the rail is a showcase, which has <Full> and
 * no rail to lose.
 */
function Figure({
  src,
  alt = "",
  aspect = "16/9",
  title,
  caption,
  width = "column",
}: {
  src?: string;
  alt?: string;
  aspect?: string;
  title?: string;
  caption?: string;
  width?: "column" | "text";
}) {
  return (
    <figure
      className={`reveal my-14 flex flex-col gap-4 ${width === "text" ? TEXT : ""}`}
    >
      <div
        className="relative w-full overflow-hidden bg-oxley-700/10"
        style={{ aspectRatio: cssRatio(aspect) }}
      >
        {src ? (
          <Image
            src={mediaUrl(src)}
            alt={alt || title || caption || ""}
            fill
            sizes={
              width === "text"
                ? "(min-width: 700px) 620px, 100vw"
                : "(min-width: 1400px) 1088px, (min-width: 1024px) 78vw, 100vw"
            }
            quality={IMAGE_QUALITY}
            className="object-cover"
          />
        ) : (
          <Placeholder />
        )}
      </div>
      {(title || caption) && (
        <figcaption className={`${TEXT} flex flex-col gap-1`}>
          {title && (
            <span className="text-base leading-[1.4] font-medium text-on-surface">
              {title}
            </span>
          )}
          {caption && (
            <span
              className={
                title
                  ? "text-base leading-[1.5] text-body"
                  : "font-mono text-sm leading-[1.4] text-oxley-700"
              }
            >
              {caption}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * A set of short, parallel points — three research findings, four reasons, the
 * options that were on the table.
 *
 * Auto-fit rather than a fixed column count, so two items make two columns and
 * four make four without the author counting. No rules, which is the same
 * conclusion the showcase's <Impact> grid reached: hairlines around three
 * items read as a table that isn't there. The title carries the ink and the
 * body carries the reading colour, so the two ranks inside a card are already
 * legible, and the grid's own alignment is what says where one card ends.
 */
function Cards({ children }: { children?: ReactNode }) {
  return (
    <div className="my-14 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
      {children}
    </div>
  );
}

function Card({ title, children }: { title?: string; children?: ReactNode }) {
  return (
    <div className="reveal flex flex-col gap-2">
      {title && (
        <p className="text-base leading-[1.4] font-medium text-on-surface">
          {title}
        </p>
      )}
      <div className={`${BODY} [&>*:last-child]:mb-0`}>{children}</div>
    </div>
  );
}

/**
 * What actually happened after a decision.
 *
 * The block this format has that the reference doesn't, and the reason for it
 * is the feedback that started the rework: a portfolio that shows craft but
 * not consequence. A decision section that ends at the decision is a designer
 * describing intent; one that says what the thing did afterwards — including
 * where it did nothing — is a designer who shipped and then looked.
 *
 * Deliberately unscored. No green for the ones that worked and no red for the
 * ones that didn't: the site has a four-step ink ramp and no semantic colour,
 * and a verdict badge would make the reader take the colour's word for it
 * instead of reading the sentence. The rule and the mono label are enough to
 * mark it as a different kind of statement from the prose above it.
 */
function Outcome({
  label = "What happened",
  children,
}: {
  label?: string;
  children?: ReactNode;
}) {
  return (
    <aside
      className={`reveal ${TEXT} my-8 border-l border-oxley-700/40 py-1 pl-5`}
    >
      <p className="mb-2 font-mono text-sm leading-[1.3] text-oxley-700">
        {label}
      </p>
      <div className={`${BODY} [&>*:last-child]:mb-0`}>{children}</div>
    </aside>
  );
}

/**
 * A figure and what it measures. Same construction as the showcase's, and the
 * note there carries: the number leads, the mono carries it, the label drops
 * to Inter and the basis to mono `text-sm`, so the three lines rank.
 */
const STAT_FIGURE =
  "font-mono text-[clamp(1.5rem,2.33vw,2rem)] leading-none font-medium text-on-surface";

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
      <span className={STAT_FIGURE}>{value}</span>
      <div className="flex flex-col gap-1">
        <span className="text-base leading-[1.4] text-body">{label}</span>
        {note && (
          <span className="font-mono text-sm leading-[1.3] text-oxley-700">
            {note}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * The grid the figures sit in. Unlike the showcase's <Impact> it brings no
 * heading of its own — in this format the `##` above it already named the
 * section, and a component that prints a second heading is how a page ends up
 * saying "Impact" twice.
 */
function Stats({ children }: { children?: ReactNode }) {
  return (
    <div className="my-14 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] sm:gap-x-12">
      {children}
    </div>
  );
}

/** One image in a <Row>: equal-width column at its aspect, optional caption. */
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
            sizes="(min-width: 1024px) 40vw, 100vw"
            quality={IMAGE_QUALITY}
            className="object-cover"
          />
        ) : (
          <Placeholder />
        )}
      </div>
      {caption && (
        <figcaption className="font-mono text-sm leading-[1.4] text-oxley-700">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** Images side by side within the column; stacks below `sm`. */
function Row({ children }: { children?: ReactNode }) {
  return (
    <div className="my-14 flex flex-col gap-6 sm:flex-row sm:items-start">
      {children}
    </div>
  );
}

export const studyMdxComponents: MDXComponents = {
  Lede,
  Figure,
  Cards,
  Card,
  Outcome,
  Stats,
  Stat,
  Row,
  Img,
  // CaseVideo owns its playback and takes no className, so the reveal rides a
  // wrapper — as on the showcase. It is full-bleed there and stays full-bleed
  // here; a column-width clip would need CaseVideo to give up its own margins,
  // and no study has asked for one yet.
  Video: (props: ComponentPropsWithoutRef<typeof CaseVideo>) => (
    <div className="reveal">
      <CaseVideo {...props} />
    </div>
  ),

  h2: ({ children, ...props }: ComponentPropsWithoutRef<"h2">) => (
    <h2 id={sectionId(childText(children))} className={SECTION} {...props}>
      {children}
    </h2>
  ),
  // A decision, a finding, a step — the divisions inside a section. Ink and
  // 20px: big enough to break the column, small enough that it never competes
  // with the <Lede> the section opened on.
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3
      className={`reveal ${TEXT} mt-14 mb-3 text-xl leading-[1.35] font-medium text-on-surface`}
      {...props}
    />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className={`reveal ${TEXT} mb-5 ${BODY}`} {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className={`reveal ${TEXT} mb-5 list-disc space-y-2 pl-5 ${BODY} marker:text-oxley-700`}
      {...props}
    />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className={`reveal ${TEXT} mb-5 list-decimal space-y-2 pl-5 ${BODY} marker:text-oxley-700`}
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
      className={`reveal ${TEXT} my-8 border-l border-oxley-700/40 pl-5 text-body italic`}
      {...props}
    />
  ),
  hr: () => (
    <hr className={`${TEXT} my-12 border-0 border-t border-oxley-700/40`} />
  ),
};
