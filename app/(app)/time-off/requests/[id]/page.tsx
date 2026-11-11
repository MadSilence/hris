import { TimeOffDecisionContainer } from "@/components/modules/timeOffDecision";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ decline?: string }> };

/**
 * One leave request and what its decision needs — where the approval notification leads. `?decline=1` is Home's
 * Decline: the reason field opens focused (the home redesign).
 */
export default async function TimeOffRequestPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { decline } = await searchParams;
  return <TimeOffDecisionContainer requestId={id} startDeclining={decline === "1"} />;
}
