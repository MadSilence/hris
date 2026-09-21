import { PageGate } from "@/components/auth/PageGate";
import { ProcessesListContainer } from "@/components/modules/lifecycle/processes/ProcessesListContainer";

export default function ProcessesPage() {
  return (
    <PageGate resource="PEOPLE.LIFECYCLE_PROCESSES" action="VIEW">
      {/* Full height for the same reason as Tasks — see that page. `6rem` is the shell's padding. */}
      <div className="mx-auto flex h-[calc(100svh-6rem)] w-full max-w-6xl flex-col gap-4">
        <div className="shrink-0">
          <h1 className="text-3xl font-semibold text-brown-900">Processes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Preboarding and onboarding under way.</p>
        </div>
        <ProcessesListContainer />
      </div>
    </PageGate>
  );
}
