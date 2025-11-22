"use client";

import { useParams } from "next/navigation";
import { PersonalInfoContainer } from "@/components/modules/organization/modules/profile/components/PersonalInfoContainer/PersonalInfoContainer";
import { useUser } from "@/components/hooks/useUser/useUser";

export default function PersonalInfoPage() {
  const { id } = useParams<{ id: string }>();
  const { data: user } = useUser(id);
  return <PersonalInfoContainer user={user}/>;
}
