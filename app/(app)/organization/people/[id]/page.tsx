import { redirect } from "next/navigation";

export default function UserIndex({ params }: { params: { id: string } }) {
  redirect(`${params.id}/personal`);
}
