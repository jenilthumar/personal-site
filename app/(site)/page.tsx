import { getAllWork, getWorkFeed } from "@/lib/content";
import { HomeView } from "@/app/components/HomeView";
import { WorkGrid } from "@/app/components/WorkGrid";

export default function Home() {
  return (
    <>
      <h1 className="sr-only">Jenil HT — Selected work</h1>
      <HomeView feed={getWorkFeed()} grid={<WorkGrid items={getAllWork()} />} />
    </>
  );
}
