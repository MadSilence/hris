import { Suspense } from "react";
import { HubManageGate, PostsContainer } from "@/components/modules/hub/manage";

export default function HubManagePostsPage() {
  return (
    <HubManageGate>
      {/* `useSearchParams` (`?new=1`, `?edit={id}`) needs a Suspense boundary under the App Router. */}
      <Suspense fallback={null}>
        <PostsContainer />
      </Suspense>
    </HubManageGate>
  );
}
