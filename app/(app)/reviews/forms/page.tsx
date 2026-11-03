import { PageGate } from "@/components/auth/PageGate";
import { ReviewFormsContainer } from "@/components/modules/reviews/forms/ReviewFormsContainer";

export default function ReviewFormsPage() {
  return (
    <PageGate resource="REVIEWS.FORM" action="VIEW">
      <ReviewFormsContainer />
    </PageGate>
  );
}
