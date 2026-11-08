import { redirect } from "next/navigation";
import { withQuery, type SearchParams } from "../redirectQuery";

/** The old address of a new automation. */
export default async function OldNewAutomationPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  redirect(withQuery("/automations/new", await searchParams));
}
