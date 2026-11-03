import { PersonReviewsTab } from "@/components/modules/reviews/packets/PersonReviewsTab";

/** The person's performance reviews by cycle (REVIEWS_DESIGN.md § 12.6). */
export default async function ReviewsTabPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PersonReviewsTab userId={id}/>;
}
