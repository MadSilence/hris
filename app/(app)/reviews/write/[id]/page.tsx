import { WriteReviewContainer } from "@/components/modules/reviews/writing/WriteReviewContainer";

type Props = { params: Promise<{ id: string }> };

/** Nobody needs a right to write their own review; the backend refuses anybody else's. */
export default async function WriteReviewPage({ params }: Props) {
  const { id } = await params;
  return <WriteReviewContainer assignmentId={id} />;
}
