import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { Separator } from "@/public/desact/src/components/ui/separator";

export const LegalEntitySkeleton = () => (
  <div className="space-y-8 px-8">
    <div className="flex items-center gap-4">
      <Skeleton className="h-10 w-10 rounded-full"/>
      <Skeleton className="h-9 w-64"/>
    </div>

    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5"/>
        <Skeleton className="h-5 w-24"/>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-32"/>
            <Skeleton className="h-5 w-full"/>
          </div>
        ))}

        <div className="space-y-2 md:col-span-2">
          <Skeleton className="h-4 w-28"/>
          <Skeleton className="h-16 w-full"/>
        </div>
      </div>
    </div>

    <Separator/>

    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5"/>
        <Skeleton className="h-5 w-24"/>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-28"/>
            <Skeleton className="h-5 w-full"/>
          </div>
        ))}
      </div>
    </div>

    <div className="flex justify-end gap-3 pt-4">
      <Skeleton className="h-10 w-20"/>
      <Skeleton className="h-10 w-16"/>
    </div>
  </div>
);
