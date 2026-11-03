import { PageGate } from "@/components/auth/PageGate";
import { CycleBuilderContainer } from "@/components/modules/reviews/cycles/builder/CycleBuilderContainer";

export default function NewReviewCyclePage() {
  return (
    <PageGate resource="REVIEWS.CYCLE" action="MANAGE">
      <CycleBuilderContainer cycle={null} />
    </PageGate>
  );
}
