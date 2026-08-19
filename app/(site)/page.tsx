import { getWorkByCategory } from "@/lib/content";
import { WorkSection } from "@/app/components/WorkSection";
import { site } from "@/lib/site";
import { LineField } from "@/app/components/LineField";
import { Statement } from "@/app/components/Statement";

export default function Home() {
  return (
    // The statement and the work are two different things, so the space
    // between them is bigger than the space inside either — 112/192 against the
    // 56/96 that separates one project from the next. The shell's own gap above
    // the statement is untouched, so the fold arithmetic below still holds.
    <div className="flex flex-col gap-28 lg:gap-48">
      {/* The first screen: masthead, statement, then the drawing running to the
          bottom edge. How the height divides between the last two swaps at
          `lg` — see the note on the box below.

          The drawing used to be above the statement and pinned it to the fold.
          Moving it below does two things at once. The statement stops being the
          last thing on the screen and starts being the subject of it, which is
          the whole of its hierarchy — it's the only heading on the page and it
          was reading like a footer. And the drawing, sitting on the fold with
          its dense edge at the bottom, becomes the rule between this screen and
          the work below it. It was already densest at the bottom and dissolving
          upward, so it needed no changing to do that job; it just needed to be
          somewhere the job existed.

          The box has to be told how much of the viewport is already spoken
          for, because CSS can't ask how far down the page an element begins.
          That figure is the shell's top padding, the masthead, and the shell's
          gap beneath it — 16 + 44 + 56 = 116 below `lg`, and 16 + 130 + 96 =
          242 from `lg`, where the bar lays the work index out in columns.

          Nothing is subtracted beyond that, so the box ends exactly on the
          fold. It used to give back one more gutter, from when the statement
          was the last thing here and needed to sit off the bottom edge like
          every other block on the site. The drawing wants the opposite: it runs
          to the window's edge on three sides now, and a 16px band of background
          under it turned a divider back into a picture of one.

          `svh`, not `dvh`: the two are identical at load, but a phone's
          viewport grows as the URL bar retracts, and `dvh` would reflow the
          statement mid-scroll. `min-h` rather than `h` so a short landscape
          window lets the statement run its natural height instead of being
          squeezed.

          The masthead figure tracks the work index — a fifth project adds a
          row to the `lg` bar and 242 becomes 267. */}
      <div className="flex min-h-[calc(100svh-116px)] flex-col gap-8 lg:min-h-[calc(100svh-242px)] lg:gap-16">
        {/* Which of these two absorbs the leftover space swaps at `lg`, and
            that is the whole of the layout.

            From `lg` the statement takes it and centres, landing within 20px of
            the true middle of the window; the drawing is a fixed band beneath.
            There's enough width that the statement is only four lines, so the
            space it floats in is modest and reads as poise.

            Below `lg` the drawing takes it instead and the statement sits under
            the masthead. A phone turns the statement into seven lines and the
            masthead into a 44px bar, so a fixed band at the bottom left ~200px
            of dead screen that had to go somewhere: above the statement it read
            as a void under the nav, below it as the statement hanging in the
            middle of nothing, and splitting it did both at once. None of those
            are a spacing problem, so no amount of tuning the gap fixed them.
            Handing the space to the drawing removes it — the drawing is
            supposed to be a field, it can be any height, and at ~330px on a
            phone the dissolve has more room to read than the band ever gave it.

            `min-h-0` on whichever one is growing, so it shrinks on a short
            window instead of pushing the other off the bottom. */}

        {/* 56px over the Figma's 1376px measure, which it holds even where the
            frame runs on to 1920 — past that width the line just gets long
            rather than grand. Scales down with the column below 1440; the
            tracking is the design's -2.4px in em so it holds at every size.
            InterVariable's optical size axis moves to its display end here via
            font-optical-sizing. */}
        {/* `reveal` rides the sizing box rather than the statement so the
            sweep moves the line and the space it centres in as one thing —
            and because opacity/transform touch no box arithmetic, the fold
            calculation above doesn't know it's there. */}
        <div className="reveal flex lg:min-h-0 lg:flex-1 lg:items-center">
          <Statement as="h1" flare={site.statementFlare}>
            {site.statement}
          </Statement>
        </div>

        {/* From `lg` a fixed band: tall enough for the dissolve to read — under
            about 150px there aren't enough rows left for the dashes to break up
            gradually — and capped so it stays a rule under the statement rather
            than a second subject competing with it. Below `lg` it grows into
            whatever the statement doesn't use, which on a phone is more than
            the band would have been.

            It fades out at the top rather than stopping at an edge. The field
            already thins in that direction, so the mask only has to finish what
            the noise starts.

            `calc(50% - 50vw)` breaks it out of the shell to the window edges.
            It has to escape two things, not one: the shell's 16/32px gutter and
            its 1920px cap. Cancelling the gutter with `-mx-8` would do the
            first and leave the drawing stopping short on a wide display, where
            it would read as an image sitting in the column rather than as the
            page's own surface. The percentage resolves against the column and
            the vw against the window, so one expression covers both. */}
        <LineField className="reveal min-h-0 flex-1 lg:h-[clamp(150px,24svh,280px)] lg:flex-none [margin-inline:calc(50%_-_50vw)] [mask-image:linear-gradient(to_bottom,transparent,black_22%,black_100%)]" />
      </div>

      {/* Both sections in full, newest first — the headers count what they
          hold, so these are whole lists rather than a selection off the top.
          Only the first cover of the first section races the fold; everything
          below it loads lazily on the way down. */}
      <WorkSection
        id="projects"
        title="Projects"
        items={getWorkByCategory("project")}
        cta="View project"
        eager
      />

      {/* The photo sets are their own body of work rather than a footnote to
          the projects, so they get the same frame, the same 2.10:1 crop and a
          heading at the same size — the only thing that changes is what the
          link calls itself. A set isn't a project and shouldn't say it is, and
          "Explore" is the right verb for something you wander rather than
          read. */}
      <WorkSection
        id="photography"
        title="Photography"
        items={getWorkByCategory("photography")}
        cta="Explore"
      />
    </div>
  );
}
