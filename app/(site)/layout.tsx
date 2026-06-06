import { Sidebar } from "@/app/components/Sidebar";

/**
 * Shell for the sidebar-bearing pages (home + About/Explorations/Contact).
 * Fluid 24px gutters: exactly the Figma at 1440px (336 + 96 + 960), then the
 * main column grows to fill, capped at 1920px on very wide screens. The
 * full-bleed project pages live outside this group and skip the sidebar.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[1920px] flex-col gap-12 px-6 py-6 lg:flex-row lg:gap-24">
      <Sidebar />
      <main className="min-w-0 flex-1 lg:pt-[52px]">{children}</main>
    </div>
  );
}
