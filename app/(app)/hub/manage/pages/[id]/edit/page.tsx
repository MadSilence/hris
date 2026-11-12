import { HubManageGate, PageEditorContainer } from "@/components/modules/hub/manage";

type Props = { params: Promise<{ id: string }> };

export default async function HubPageEditorPage({ params }: Props) {
  const { id } = await params;
  return (
    <HubManageGate>
      <PageEditorContainer id={id} />
    </HubManageGate>
  );
}
