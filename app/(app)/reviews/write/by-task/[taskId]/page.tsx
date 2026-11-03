import { ReviewByTaskRedirect } from "@/components/modules/reviews/writing/ReviewByTaskRedirect";

type Props = { params: Promise<{ taskId: string }> };

/** A Tasks row knows its task, not its review: this finds the review and moves on to it. */
export default async function ReviewByTaskPage({ params }: Props) {
  const { taskId } = await params;
  return <ReviewByTaskRedirect taskId={taskId} />;
}
