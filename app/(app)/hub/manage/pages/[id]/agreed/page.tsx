import { HubManageGate, WhoAgreedContainer } from "@/components/modules/hub/manage";

type Props = { params: Promise<{ id: string }> };

export default async function HubWhoAgreedPage({ params }: Props) {
  const { id } = await params;
  return (
    <HubManageGate>
      <WhoAgreedContainer id={id} />
    </HubManageGate>
  );
}
