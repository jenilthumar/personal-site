import { ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { workHref, type WorkItem } from "@/lib/content";
import { IMAGE_QUALITY, mediaUrl, PHOTO_QUALITY } from "@/lib/media";

/**
 * One section of the home page's work index: a header naming the section and
 * counting it, then one cover per entry with that entry's metadata underneath
 * — title on the left, discipline and year on the right, no call to action.
 * Home renders it twice — Projects, then Photography — and the two are the same
 * component rather than the same layout written twice, so a change to the crop
 * or the metadata row can't drift between them.
 *
 * Every entry shows a single frame, cut to 2.10:1, two to a row. What stood
 * here before was a curated multi-row grid — each project declaring two or
 * three rows of its case-study media on a shared three-column track — and the
 * cost of it was that no two projects arrived at the same size. A project was
 * whatever its rows happened to add up to, so scrolling the page was scrolling
 * a stack of different shapes, and the eye spent its attention on the layout
 * rather than the work. One frame each is the trade: less of every project,
 * but the four of them finally compare.
 *
 * They compare harder side by side than stacked. A one-per-row list at 1216px
 * put a screen and a half between one cover and the next, so comparing two
 * meant remembering one; at 676px a pair sits in the same glance and the whole
 * of Projects is two rows. The cost is real and it is the picture — a cover is
 * a little over half the size it was, and the art direction inside it has to
 * survive that.
 *
 * 2.10:1 is what makes the frame carry at either width. It's the crop the
 * cover files are cut to and the shape the case-study hero opens on, so the
 * morph below is a move rather than a reshape, and at 676px it stands 322px
 * tall — short enough that a whole row plus both captions lands in one view.
 *
 * The project covers are re-cut originals, not crops of the old heroes —
 * 3840×1828 at `work/<slug>/cover-210.webp`, and the case study's hero as well,
 * which is what keeps the morph below honest. Photography covers are ordinary
 * photographs at their own ratios and take the crop, which is a real cost for a
 * 4:3 frame: a third of its height goes. Worth an eye on each one.
 */

/**
 * The index takes the shell's full column and declares no width of its own.
 *
 * It used to carry a growing inset — `clamp(0px, 26vw - 128px, 320px)` of
 * padding a side — from when every entry was a single 1216px frame, and that
 * inset was there to stop one cover reading as a wall. Splitting the row in
 * two does the same job better: each cover is a little under half the column,
 * which is the size the inset was reaching for, and it gets there by fitting
 * more work on the screen rather than by leaving space empty.
 *
 * With the inset gone the covers start at the shell's own gutter, on the same
 * left edge as the masthead and the statement. They run past the statement's
 * right edge on a wide display, and that's the shell's stated division rather
 * than a mistake: 1376 is a measure for type, and media takes the extra room.
 */

/**
 * What a cover asks the optimizer for. From `md` the track is
 * (min(1920, 100vw) - 64 gutters - 24 gutter) / 2, which is 50vw - 44 and
 * rounds to about 47vw until the shell's own cap takes over at 1920 and pins
 * it to 916px. Below `md` it's one column, the full width less the gutters.
 * `sizes` only picks which srcset candidate gets used, and the candidates are
 * coarse enough that a percent or two of drift resolves to the same file.
 */
const COVER_SIZES = [
  "(min-width: 1920px) 916px",
  "(min-width: 768px) 47vw",
  "92vw",
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
  section,
  eager,
}: {
  item: WorkItem;
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

  // Discipline and year, the way a catalogue lists a work. The year is read
  // off `date`, which is the field that already orders this list, so an entry
  // can't be filed under one year and labelled another. Either half may be
  // missing — a set with no tags, an entry with no date — so the parts are
  // joined rather than written as a template.
  const spec = [qualifier, item.date.slice(0, 4)].filter(Boolean).join(" · ");

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
            to crowd it.

            The caption takes the reveal; the cover above deliberately doesn't.
            The cover is the morph's other end, and a view transition that
            pairs into an element mid-reveal captures it half-faded — coming
            back from a case study, the hero would fly home into nothing. The
            hero travels, the caption sweeps. */}
        <div className="reveal mt-4 flex flex-col gap-2">
          {/* Title left, spec right, and nothing in between asking to be
              clicked. There used to be a "View project ›" on this side, which
              was the one piece of chrome on a page that has no buttons
              anywhere else: the cover is 1216px of link, the whole row is
              inside the same anchor, and the title already lights up on hover.
              A label naming the affordance was telling the reader something
              the layout had said twice already.

              What sits there instead is what the row was short of — the
              discipline and the year, which is the pair a reader actually
              wants off an index. The qualifier used to ride beside the title
              in brackets; out here it's a column of its own and the brackets
              would be doing a job the position now does.

              Caps mono, matching the section labels in a study case study.
              16px against the row's 18 rather than matching it: size-adjust
              pins the mono to Inter's x-height, so at 18 the two would stand
              exactly as tall and nothing would rank the spec under the title
              it qualifies. A fixed advance also runs about a fifth wider than
              Inter's average across these words, and caps are wider again, so
              the step down is what keeps WEB & VISUAL DESIGN from outweighing
              a title like Shilp. The row's -0.16px doesn't reach it:
              globals.css resets tracking for every mono on the site.

              Baselines, not centres — two sizes of type on one line line up on
              the baseline they share. */}
          <div className="flex items-baseline justify-between gap-6 text-[18px] leading-[1.2] tracking-[-0.16px]">
            <h3 className="min-w-0 truncate font-medium text-on-surface">
              {item.title}
            </h3>

            {spec && (
              <span className="shrink-0 font-mono text-base text-oxley-700 uppercase transition-colors group-hover/project:text-on-surface">
                {spec}
              </span>
            )}
          </div>

          {/* The outcome line is parked, not gone. `outcome` is still on every
              project's frontmatter and still typed in lib/content.ts, and the
              case studies still open on the same material — it's only this
              index that has stopped printing it.

              The idea was right: a cover and a title say what a project looked
              like and nothing about whether it did anything, so the result
              should read before the click. The lines themselves weren't up to
              it. "Live at operagroup.co.in" is a fact about a URL, and "Never
              took a client" is an admission — neither is the sentence that
              makes someone open the case study, and three weak ones in a row
              made the whole index read as hedged. Better nothing than a line
              that undersells the work it's advertising.

              It also happens to be what makes the 24px row gap sit right. With
              a one-line caption under every cover the rows are even; with an
              outcome under some and not others, one card's second line ran
              within 24px of the cover below and started reading as a caption
              for it.

              Bring it back when there are four lines worth reading. */}
        </div>
      </Link>
    </li>
  );
}

export function WorkSection({
  id,
  title,
  items,
  eager = false,
}: {
  /** Slug for the heading's id, so the section can be labelled by it. */
  id: string;
  title: string;
  items: WorkItem[];
  /** True for the section nearest the fold; only its first row races. */
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
          16px beside a 48px word. Raised by aligning the flex row to the top
          of the line, not by `vertical-align`, which a flex item ignores.

          Read off the list, so it can't drift out of date. */}
      <h2
        id={`${id}-title`}
        className="reveal flex items-start font-display text-[clamp(2rem,3.49vw,3rem)] leading-[1.3] text-on-surface"
      >
        {title}
        <span className="ml-[0.15em] font-mono text-[0.5em] text-oxley-700">
          [{items.length}]
        </span>
      </h2>

      {/* Two columns from `md`: 24px between them, 32px between rows.
          Deliberately not the same figure. The caption belongs to the cover
          above it and sits 16px under it, so the space below has to beat that
          clearly or the line reads as floating between two images — at an even
          24 it was 16 above and 24 below, near enough to equidistant to be
          ambiguous. 32 puts it at double its own gap and settles the question.
          The gutter stays 24 because nothing sits in it to be claimed.

          One column below `md`, where 24px of gutter would leave each cover
          about 150px wide. */}
      <ul className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2">
        {items.map((item, index) => (
          <Entry
            key={item.slug}
            item={item}
            section={title}
            eager={eager && index < 2}
          />
        ))}
      </ul>
    </section>
  );
}
