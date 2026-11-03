import { NominationContainer } from "@/components/modules/reviews/steps/NominationContainer";

type Props = { params: Promise<{ id: string }> };

/** Peers nominated by the person reviewed: their page to nominate, their manager's to approve (REVIEWS_PLAN.md 10.2). */
export default async function ReviewNominationPage({ params }: Props) {
  const { id } = await params;
  return <NominationContainer participantId={id} />;
}
