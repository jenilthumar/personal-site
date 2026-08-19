import { Reveal } from "@/app/components/Reveal";

/**
 * Re-arms the reveal sweep per case study. Templates remount when their child
 * segment changes — including the dynamic param, so following Next Work from
 * one project into another replays the entrance even though both pages render
 * the same components. The morphing hero is no part of this (it carries no
 * .reveal); the view transition and the sweep run side by side.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Reveal />
    </>
  );
}
