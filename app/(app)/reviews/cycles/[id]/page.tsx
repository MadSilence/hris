import { PageGate } from "@/components/auth/PageGate";
import { CyclePageContainer } from "@/components/modules/reviews/cycles/CyclePageContainer";

type Props = { params: Promise<{ id: string }> };

export default async function ReviewCyclePage({ params }: Props) {
  const { id } = await params;
  return (
    <PageGate resource="REVIEWS.CYCLE" action="VIEW">
      <CyclePageContainer cycleId={id} />
    </PageGate>
  );
}
