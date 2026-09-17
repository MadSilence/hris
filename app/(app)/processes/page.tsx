import { PageGate } from "@/components/auth/PageGate";
import { ProcessesListContainer } from "@/components/modules/lifecycle/processes/ProcessesListContainer";

export default function ProcessesPage() {
  return (
    <PageGate resource="PEOPLE.LIFECYCLE_PROCESSES" action="VIEW">
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <div>
          <h1 className="text-3xl font-semibold text-brown-900">Processes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Preboarding and onboarding under way.</p>
        </div>
        <ProcessesListContainer />
      </div>
    </PageGate>
  );
}
