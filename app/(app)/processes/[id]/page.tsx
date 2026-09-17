import { PageGate } from "@/components/auth/PageGate";
import { ProcessDetailContainer } from "@/components/modules/lifecycle/processes/ProcessDetailContainer";

type Props = { params: Promise<{ id: string }> };

export default async function ProcessPage({ params }: Props) {
  const { id } = await params;
  return (
    <PageGate resource="PEOPLE.LIFECYCLE_PROCESSES" action="VIEW">
      <div className="mx-auto w-full max-w-6xl">
        <ProcessDetailContainer processId={id} />
      </div>
    </PageGate>
  );
}
