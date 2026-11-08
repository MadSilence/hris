import { redirect } from "next/navigation";
import { withQuery, type SearchParams } from "../redirectQuery";

/** The old address of one automation — links in emails sent before the move still point here. */
export default async function OldAutomationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { id } = await params;
  redirect(withQuery(`/automations/${encodeURIComponent(id)}`, await searchParams));
}
