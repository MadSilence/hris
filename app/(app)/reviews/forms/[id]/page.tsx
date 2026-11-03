import { PageGate } from "@/components/auth/PageGate";
import { ReviewFormEditorContainer } from "@/components/modules/reviews/forms/editor/ReviewFormEditorContainer";

type Props = { params: Promise<{ id: string }> };

export default async function ReviewFormEditorPage({ params }: Props) {
  const { id } = await params;
  return (
    <PageGate resource="REVIEWS.FORM" action="VIEW">
      <ReviewFormEditorContainer formId={id} />
    </PageGate>
  );
}
