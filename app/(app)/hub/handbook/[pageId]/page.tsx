import { PageContainer } from "@/components/modules/hub/reader";

type Props = { params: Promise<{ pageId: string }>; searchParams: Promise<{ preview?: string }> };

/** CP02; `?preview=1` is the editor's draft as a reader would see it (CM06 Preview, opened in a new tab). */
export default async function HubHandbookPagePage({ params, searchParams }: Props) {
  const { pageId } = await params;
  const { preview } = await searchParams;
  return <PageContainer id={pageId} preview={preview === "1"} />;
}
