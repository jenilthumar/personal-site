import { Reveal } from "@/app/components/Reveal";

/**
 * Re-arms the reveal sweep per photo set — same arrangement as the work
 * template: a remount per slug is what lets one set's entrance play when
 * arriving from another set.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Reveal />
    </>
  );
}
