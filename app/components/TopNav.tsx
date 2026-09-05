import { getWorkByCategory, workHref, type WorkItem } from "@/lib/content";
import { TopNavBar } from "./TopNavBar";
import type { NavItem } from "./nav-parts";
import type { NavInk } from "./TopNavBar";

/**
 * The masthead. Server half: reads the work collection through `lib/content`,
 * which imports `node:fs` and so can never cross into the browser bundle, and
 * hands plain data to the route-aware bar. TopNavBar draws it.
 *
 * It appears on every page now, including the ones outside the shell: those
 * render it themselves, since they sit outside the (site) layout that draws it
 * for home, About, Running and Contact.
 *
 * `ink` is what a case study passes when the bar is standing on its hero
 * rather than on the page surface. See the `heroInk` note in lib/content.ts.
 */
export type { NavItem };

export function TopNav({ ink }: { ink?: NavInk }) {
  const toItem = (item: WorkItem): NavItem => ({
    slug: item.slug,
    title: item.title,
    href: workHref(item),
  });

  return (
    <TopNavBar
      projects={getWorkByCategory("project").map(toItem)}
      photography={getWorkByCategory("photography").map(toItem)}
      ink={ink}
    />
  );
}
