import { getAllWork } from "@/lib/content";
import { WorkGrid } from "@/app/components/WorkGrid";

export default function Home() {
  const items = getAllWork();

  return (
    <>
      <h1 className="sr-only">Jenil HT — Selected work</h1>
      <WorkGrid items={items} />
    </>
  );
}
