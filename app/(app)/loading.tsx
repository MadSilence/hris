import { Skeleton } from "@/components/desact/skeleton";

const ROWS = ["row-1", "row-2", "row-3", "row-4", "row-5", "row-6", "row-7", "row-8"];

/**
 * What a navigation shows inside the shell until the next page answers. Every route here reads cookies, so
 * none is prerendered: without this boundary a click shows nothing at all until the server has replied.
 */
export default function AppLoading() {
  return (
    <div className="flex flex-col gap-6 p-8" role="status" aria-busy="true">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="flex flex-col gap-3">
        {ROWS.map((row) => (
          <Skeleton key={row} className="h-9 w-full" />
        ))}
      </div>
    </div>
  );
}
