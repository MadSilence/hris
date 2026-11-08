import { redirect } from "next/navigation";
import { withQuery, type SearchParams } from "./redirectQuery";

/** The address the automations list had while it lived in Settings; it is a main page now (`/automations`). */
export default async function OldAutomationsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  redirect(withQuery("/automations", await searchParams));
}
