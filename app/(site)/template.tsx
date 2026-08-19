import { Reveal } from "@/app/components/Reveal";

/**
 * Re-arms the reveal sweep for the shell pages. A template remounts whenever
 * the segment under it changes (a layout wouldn't), so navigating Home ↔
 * About ↔ Contact ↔ Running hands Reveal a fresh mount and the new page gets
 * its entrance. Reveal sits after the page so its effect runs once the page's
 * own subtree has mounted.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Reveal />
    </>
  );
}
