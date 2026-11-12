import { Suspense } from "react";
import { HubManageGate, OverviewContainer } from "@/components/modules/hub/manage";

/** CM01. Managing the hub is HUB.CONTENT EDIT; the gate is UX, Java's AccessEngine decides. */
export default function HubManageOverviewPage() {
  return (
    <HubManageGate>
      {/* `useSearchParams` (which post the dialog shows) needs a Suspense boundary under the App Router. */}
      <Suspense fallback={null}>
        <OverviewContainer />
      </Suspense>
    </HubManageGate>
  );
}
