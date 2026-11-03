import { StepByTaskRedirect } from "@/components/modules/reviews/steps/StepByTaskRedirect";

type Props = { params: Promise<{ taskId: string }> };

/** A Tasks row of a review step knows its task, not its page: this finds the step and moves on to it. */
export default async function ReviewStepByTaskPage({ params }: Props) {
  const { taskId } = await params;
  return <StepByTaskRedirect taskId={taskId} />;
}
