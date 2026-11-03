import { PacketContainer } from "@/components/modules/reviews/packets/PacketContainer";

type Props = { params: Promise<{ id: string }> };

/** A person's review in one cycle, as far as the reader may see it — the backend decides. */
export default async function ReviewPacketPage({ params }: Props) {
  const { id } = await params;
  return <PacketContainer participantId={id} />;
}
