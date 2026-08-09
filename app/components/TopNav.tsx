import Image from "next/image";
import Link from "next/link";
import { getWorkByCategory, workHref, type WorkItem } from "@/lib/content";
import { site } from "@/lib/site";
import { BulletMark, CornerBrackets } from "./PixelMarks";

/**
 * The masthead: name on the left, the work index and the standalone pages in
 * the middle, Contact on the right. It replaces the old left sidebar, so the
 * whole page below it is one column.
 *
 * The five icons are raster pixel art exported from the design (there's no
 * vector version), sized here exactly as the design frames them: a 24px box
 * with the artwork sitting at its own size inside, clipped. Running's glyph is
 * deliberately larger than its box and gets cropped.
 */

export type NavItem = { slug: string; title: string; href: string };

/**
 * The 24px box each glyph sits in, plus its hover.
 *
 * The icons are pixel art, so the hop is quantised to match: `steps(2)` moves
 * it in two 1px jumps instead of gliding, which reads as a sprite nudging
 * rather than CSS easing. `jump-start` spends the first jump immediately, so
 * the icon has already moved on the frame the pointer lands.
 *
 * It hangs off the whole nav group, not the glyph — hovering anywhere in the
 * Projects list nudges the folder. The folder headers aren't links, so
 * reacting to their own hover would imply a click that isn't there.
 */
const ICON_BOX =
  "relative size-6 shrink-0 overflow-hidden transition-[translate,filter] duration-150 ease-[steps(2,jump-start)] group-hover/nav:brightness-125 motion-safe:group-hover/nav:-translate-y-0.5";

function FolderGroup({
  icon,
  label,
  items,
  /** Design gives the two folder headers different icon-to-label gaps. */
  headerGap,
  itemsIndent,
}: {
  icon: React.ReactNode;
  label: string;
  items: NavItem[];
  headerGap: string;
  itemsIndent: string;
}) {
  if (!items.length) return null;
  return (
    <section className="group/nav flex flex-col gap-2">
      <h2 className={`flex items-center ${headerGap} font-medium text-on-surface`}>
        {icon}
        {label}
      </h2>
      <ul className={`flex flex-col gap-1 ${itemsIndent}`}>
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={item.href}
              className="flex items-center gap-1 text-on-surface transition-colors hover:text-oxley-300"
            >
              <BulletMark />
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PageLink({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group/nav flex items-center gap-1 self-start font-medium text-on-surface transition-colors hover:text-oxley-300"
    >
      {icon}
      {label}
    </Link>
  );
}

/**
 * Contact, framed by four corner ticks that behave like a reticle: hover draws
 * them 3.5px onto the label, pressing clamps them to 5 and takes a little off
 * the button. Keyboard focus gets the hover state, so it reads as a state
 * rather than a mouse trick.
 *
 * The press doesn't scale the button at all. The tick clamp already reads as
 * the frame contracting, and scaling a button that's mostly a word means
 * scaling the word — the type visibly resizes long before it registers as
 * give, and the two compound into something that just looks small. So the
 * clamp and the chip carry the press on their own.
 *
 * Timing is the site's press idiom, the one the sidebar toggle and the work
 * cards use — `active:duration-0`, so the press lands with no lag at all and
 * only the release is eased. Hover comes in at 150ms and relaxes out at 250,
 * which is what keeps it feeling answered rather than animated.
 *
 * Travel sits behind `motion-safe`, per the house rule in globals.css: the
 * colour shift stays for everyone, only the movement is conditional.
 */
function ContactButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="group relative flex shrink-0 items-center gap-1.5 px-4 py-2 font-medium text-on-surface transition-colors duration-250 ease-out-quart hover:text-oxley-300 hover:duration-150 focus-visible:text-oxley-300 active:duration-0"
    >
      <CornerBrackets className="text-[#cccccc] transition-[inset,color] duration-250 ease-out-quart group-hover:text-oxley-300 group-hover:duration-150 group-focus-visible:text-oxley-300 group-active:duration-0 motion-safe:group-hover:inset-[3.5px] motion-safe:group-focus-visible:inset-[3.5px] motion-safe:group-active:inset-[5px]" />
      Contact
      <span className="relative size-4 shrink-0 overflow-hidden rounded-[3px] bg-gradient-to-b from-on-surface/10 to-[#bfbfbf]/10 transition-colors duration-250 ease-out-quart group-hover:from-on-surface/25 group-hover:to-[#bfbfbf]/25 group-hover:duration-150 group-active:from-on-surface/40 group-active:to-[#bfbfbf]/40 group-active:duration-0">
        <Image
          src="/nav/contact.png"
          alt=""
          width={14}
          height={14}
          className="absolute left-1/2 top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2"
        />
      </span>
    </Link>
  );
}

export function TopNav() {
  const toItem = (item: WorkItem): NavItem => ({
    slug: item.slug,
    title: item.title,
    href: workHref(item),
  });

  const projects = getWorkByCategory("project").map(toItem);
  const photography = getWorkByCategory("photography").map(toItem);

  return (
    // Wraps to two lines below `lg`: name and Contact share the first, the nav
    // takes the second. `order` keeps Contact last on the wide layout.
    <header className="flex flex-wrap items-start gap-y-8 text-base leading-[1.3] lg:flex-nowrap">
      <Link
        href="/"
        className="order-1 pt-[6px] font-medium text-on-surface transition-colors hover:text-oxley-300"
      >
        {site.name}
      </Link>

      <nav
        aria-label="Site"
        className="order-3 flex w-full flex-wrap gap-x-12 gap-y-8 pt-[6px] lg:order-2 lg:ml-28 lg:mr-auto lg:w-auto lg:flex-nowrap"
      >
        <FolderGroup
          label="Projects"
          items={projects}
          headerGap="gap-1.5"
          itemsIndent="pl-[2px]"
          icon={
            <span className={ICON_BOX}>
              <Image src="/nav/projects.png" alt="" width={24} height={24} className="size-6" />
            </span>
          }
        />
        <FolderGroup
          label="Photography"
          items={photography}
          headerGap="gap-1"
          itemsIndent="pl-[4px]"
          icon={
            <span className={ICON_BOX}>
              <Image
                src="/nav/photography.png"
                alt=""
                width={18}
                height={18}
                className="absolute left-[3.04px] top-[3.04px] size-[17.925px] max-w-none"
              />
            </span>
          }
        />
        <PageLink
          label="About"
          href="/about"
          icon={
            <span className={ICON_BOX}>
              <Image
                src="/nav/about.png"
                alt=""
                width={22}
                height={22}
                className="absolute left-1/2 top-1/2 size-[21.775px] max-w-none -translate-x-1/2 -translate-y-1/2"
              />
            </span>
          }
        />
        <PageLink
          label="Running"
          href="/running"
          icon={
            <span className={ICON_BOX}>
              <Image
                src="/nav/running.png"
                alt=""
                width={28}
                height={28}
                className="absolute left-1/2 top-1/2 size-[28.416px] max-w-none -translate-x-1/2 -translate-y-1/2"
              />
            </span>
          }
        />
      </nav>

      <div className="order-2 ml-auto lg:order-3 lg:ml-0">
        <ContactButton href="/contact" />
      </div>
    </header>
  );
}
