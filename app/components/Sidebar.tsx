import { getWorkByCategory, workHref, type WorkItem } from "@/lib/content";
import { SidebarNav, type SidebarItem } from "./SidebarNav";

/** Server wrapper: reads the work collection (fs) and hands plain data to the
   route-aware client view. */
export function Sidebar() {
  const toItem = (item: WorkItem): SidebarItem => ({
    slug: item.slug,
    title: item.title,
    href: workHref(item),
  });

  return (
    <SidebarNav
      projects={getWorkByCategory("project").map(toItem)}
      photography={getWorkByCategory("photography").map(toItem)}
    />
  );
}
