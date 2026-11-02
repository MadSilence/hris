import { PersonFormsTab } from "@/components/modules/lifecycle/questionnaires/PersonFormsTab";

/** The person's answered questionnaires (DECISIONS.md § "Lifecycle tasks", E1). */
export default async function FormsTabPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PersonFormsTab userId={id}/>;
}
