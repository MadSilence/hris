import { TimeOffDecisionContainer } from "@/components/modules/timeOffDecision";

type Props = { params: Promise<{ id: string }> };

/** One leave request and what its decision needs — where the approval notification leads. */
export default async function TimeOffRequestPage({ params }: Props) {
  const { id } = await params;
  return <TimeOffDecisionContainer requestId={id} />;
}
