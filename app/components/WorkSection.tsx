import { ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { workHref, type WorkItem } from "@/lib/content";
import { IMAGE_QUALITY, mediaUrl, PHOTO_QUALITY } from "@/lib/media";
import { ChevronMark } from "./PixelMarks";

/**
 * One section of the home page's work index: a header naming the section and
 * counting it, then one cover per entry with that entry's metadata underneath.
 * Home renders it twice — Projects, then Photography — and the two are the same
 * component rather than the same layout written twice, so a change to the crop
 * or the metadata row can't drift between them.
 *
 * Every entry shows a single frame, cut to 2.10:1. What stood here
 * before was a curated multi-row grid — each project declaring two or three
 * rows of its case-study media on a shared three-column track — and the cost
 * of it was that no two projects arrived at the same size. A project was
 * whatever its rows happened to add up to, so scrolling the page was scrolling
 * a stack of different shapes, and the eye spent its attention on the layout
 * rather than the work. One frame each is the trade: less of every project,
 * but the four of them finally compare.
 *
 * 2.10:1 is what makes that frame carry. At 16:9 a cover on the widest column
 * here stands 864px tall and eats the viewport whole; the same width at
 * 2.10:1 is 731px, which leaves the metadata line under it visible at the
 * same time as the image it belongs to. It's also wide enough that a cover
 * reads as a composed piece of art direction rather than a screenshot.
 *
 * The project covers are re-cut originals, not crops of the old heroes —
 * 3840×1828 at `work/<slug>/cover-210.webp`, and the case study's hero as well,
 * which is what keeps the morph below honest. Photography covers are ordinary
 * photographs at their own ratios and take the crop, which is a real cost for a
 * 4:3 frame: a third of its height goes. Worth an eye on each one.
 */

/**
 * The section is inset past the shell's own gutter, and the inset grows with
 * the window rather than stepping at breakpoints: nothing extra on a phone,
 * ~72px a side by 768, ~246 at 1440, and a flat 320 from about 1720 up — where
 * the page's own 1920 cap takes over and there's nothing left to scale against.
 *
 * Full-bleed was the first answer and a 1856px cover is simply too much
 * picture — the crop stops being a frame and starts being a wall. A margin is
 * what makes it a frame, and the margin has to grow with the window or it
 * stops reading as one: 96px is generous at 1024 and a hairline at 1920.
 *
 * This started as four breakpoint steps and shouldn't have. Every step this
 * ramp got steeper widened the jump either side of a breakpoint — the last
 * pass would have snapped the cover 160px narrower the moment the window
 * crossed 1280, which reads as a bug rather than a layout. One clamp has no
 * seams in it, and it's one number to move when the margin wants to be wider
 * still: raise the 26vw for a faster ramp, the 320px for a wider ceiling.
 *
 * It's an inline style rather than a utility because a clamp with two operands
 * inside a Tailwind arbitrary value has to be written with escaped spaces, and
 * `px-[clamp(0px,26vw_-_128px,320px)]` is not a thing anyone should have to
 * read twice.
 */
const SECTION_INSET = { paddingInline: "clamp(0px, 26vw - 128px, 320px)" };

/**
 * What a cover asks the optimizer for, tracking the clamp above in steps —
 * `sizes` only decides which srcset candidate gets picked, and the candidates
 * are coarse enough that a percent or two of drift lands on the same file. The
 * page caps at 1920 and the inset stops growing at 1720, so 1216px is as wide
 * as a cover is ever painted.
 */
const COVER_SIZES = [
  "(min-width: 1720px) 1216px",
  "(min-width: 1440px) 62vw",
  "(min-width: 1280px) 63vw",
  "(min-width: 1024px) 67vw",
  "(min-width: 768px) 73vw",
  "(min-width: 640px) 78vw",
  "100vw",
].join(", ");

function Cover({ item, eager }: { item: WorkItem; eager: boolean }) {
  const cover = item.cover ?? item.hero;

  if (!cover) {
    return (
      <div className="flex aspect-[21/10] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-oxley-700/25 via-oxley-700/10 to-transparent">
        <span className="text-3xl font-medium text-oxley-700/70">
          {item.title.charAt(0)}
        </span>
      </div>
    );
  }

  const image = (
    <Image
      src={mediaUrl(cover)}
      alt={item.title}
      fill
      sizes={COVER_SIZES}
      // Photography takes the full 100 the rest of the site gives it — a
      // photograph is the thing itself, where a project cover is a rendering of
      // something else and 90 is indistinguishable on it. Same split WorkCard
      // makes.
      quality={item.category === "photography" ? PHOTO_QUALITY : IMAGE_QUALITY}
      // The first cover is the one worth racing. It sits just under the fold
      // rather than on it — the statement owns the first screen — so it gets an
      // eager high-priority fetch rather than a head preload, which is what
      // `preload` is for and what the docs steer you off when either of these
      // is set. `priority` is deprecated in Next 16.
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      className="object-cover"
    />
  );

  return (
    <div className="relative aspect-[21/10] w-full overflow-hidden bg-oxley-700/10">
      {/* The cover the case study opens on: the same name at both ends, so the
          browser moves one element instead of swapping two. A project whose
          case study opens on a looping video has no still to morph into, so it
          sits the pairing out — and only one element may ever carry a given
          name while mounted, or React aborts the transition outright. */}
      {item.heroVideo || !item.hero ? (
        image
      ) : (
        <ViewTransition name={`project-hero-${item.slug}`} share="morph">
          {image}
        </ViewTransition>
      )}
    </div>
  );
}

function Entry({
  item,
  cta,
  section,
  eager,
}: {
  item: WorkItem;
  /** What the link calls itself — "View project", "View set". */
  cta: string;
  /** The section's own title, so a tag that merely repeats it can be dropped. */
  section: string;
  eager: boolean;
}) {
  // Projects state a discipline; photo sets only carry tags, and the first of
  // those is "Photography" — the word already standing 48px tall above the
  // list. So the qualifier is the first tag that says something the heading
  // hasn't: Travel, Trek, Web Design.
  const qualifier =
    item.services ??
    item.tags.find((tag) => tag.toLowerCase() !== section.toLowerCase()) ??
    item.tags[0];

  return (
    <li>
      {/* One link over the cover and its metadata both, so the work itself is
          what you click — the title alone was a small target beside a large
          image that looked clickable and wasn't. */}
      <Link
        href={workHref(item)}
        className="group/project block transition-opacity duration-200 ease-out-quart active:opacity-90 active:duration-0"
      >
        <Cover item={item} eager={eager} />

        {/* Metadata reads as a caption of the cover above it, so it sits 16px
            under the image against the 56/96px between one project and the
            next — near enough to belong to the frame it names, far enough not
            to crowd it. */}
        <div className="mt-4 flex items-center justify-between gap-6 text-[18px] leading-[1.2] tracking-[-0.16px]">
          <h3 className="flex min-w-0 items-center gap-4">
            <span className="truncate font-medium text-on-surface">
              {item.title}
            </span>
            {/* The qualifier is spec, not sentence, so it takes the mono — but
                a step down at 16px, not the row's 18. Mono set at the row's own
                size overpowers the title it qualifies: size-adjust lifts it 5%
                and the fixed advance stretches it another 30. The brackets lose
                their inner spaces for the same reason — a space here is a full
                11px advance where Inter's was 5 — and it matches the section
                count above and the unpadded [30] on the photography sets.

                Tracking resets because the row's -0.16px is drawn for Inter and
                only cramps a face that's already monospaced. */}
            {qualifier && (
              <span className="hidden shrink-0 font-mono text-base tracking-normal text-oxley-700 transition-colors group-hover/project:text-on-surface sm:inline">
                [{qualifier}]
              </span>
            )}
          </h3>

          <span className="flex shrink-0 items-center gap-1 text-on-surface transition-colors group-hover/project:text-oxley-300">
            {cta}
            {/* Nudges along in two quantised pixel steps rather than gliding. */}
            <ChevronMark className="transition-[translate] duration-150 ease-[steps(2,jump-start)] motion-safe:group-hover/project:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </li>
  );
}

export function WorkSection({
  id,
  title,
  items,
  cta,
  eager = false,
}: {
  /** Slug for the heading's id, so the section can be labelled by it. */
  id: string;
  title: string;
  items: WorkItem[];
  cta: string;
  /** True for the section nearest the fold; only its first cover races. */
  eager?: boolean;
}) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      // Title to first cover: 56px. It has to stay at or under the 56/96 that
      // separates one project from the next, or the header stops reading as
      // this list's title and starts floating between the statement above and
      // the work below. On a phone it lands exactly on that 56 — the header is
      // still bound downward, since the statement sits twice as far above it.
      className="flex flex-col gap-14"
      style={SECTION_INSET}
    >
      {/* 32px up to about 920, then it grows with the window to 48 by 1376 —
          the same measure the statement tops out on, so the two settle
          together rather than one of them still growing when the other has
          stopped. Regular weight, like every other standing heading here; at
          this size the size is the emphasis.

          It used to sit at the feed's 18px with a bracketed [4] beside it,
          which read as one more row of metadata rather than as the thing the
          rest of the page hangs off.

          The count keeps the brackets the rest of the site labels things with
          — [Web Design], [Experiment], the [30] on a photography set — but
          rides as a superscript rather than sitting on the line, which is what
          keeps it a marker beside the title instead of a second word in it.
          Closed up, no inner spaces, for the same reason those are: a space in
          this face is a full advance.

          Everything about it is in `em` — size and the space before it both —
          so the whole mark scales with the title instead of stranding a fixed
          16px beside a 48px word. Raised the way the Wordmark raises its ® — by
          aligning the flex row to the top of the line, not by `vertical-align`,
          which a flex item ignores.

          Read off the list, so it can't drift out of date. */}
      <h2
        id={`${id}-title`}
        className="flex items-start text-[clamp(2rem,3.49vw,3rem)] leading-[1.3] text-on-surface"
      >
        {title}
        <span className="ml-[0.15em] font-mono text-[0.5em] tracking-normal text-oxley-700">
          [{items.length}]
        </span>
      </h2>

      <ul className="flex flex-col gap-14 lg:gap-24">
        {items.map((item, index) => (
          <Entry
            key={item.slug}
            item={item}
            cta={cta}
            section={title}
            eager={eager && index === 0}
          />
        ))}
      </ul>
    </section>
  );
}
