import { PageGate } from "@/components/auth/PageGate";
import { CalibrationContainer } from "@/components/modules/reviews/calibration/CalibrationContainer";

type Props = { params: Promise<{ id: string }> };

/** One calibration session (REVIEWS_PLAN.md 12.1); which rows the reader sees is the backend's answer. */
export default async function CalibrationSessionPage({ params }: Props) {
  const { id } = await params;
  return (
    <PageGate resource="REVIEWS.CYCLE" action="VIEW">
      <CalibrationContainer sessionId={id} />
    </PageGate>
  );
}
