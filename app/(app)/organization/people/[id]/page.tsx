import { redirect } from "next/navigation";

/**
 * The profile always lives on a tab. This entry point used to be a route handler exported from a
 * page file, which made `/organization/people/{id}` a broken route — now it just lands on the
 * default tab.
 */
export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  redirect(`/organization/people/${id}/personal`);
}
