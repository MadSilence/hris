"use client";

import { useParams } from "next/navigation";
import { PersonalInfoContainer } from "@/components/modules/organization/modules/profile/components/PersonalInfoContainer/PersonalInfoContainer";
import { useUser } from "@/components/hooks/useUser/useUser";

export default function PersonalInfoPage() {
  const { id } = useParams<{ id: string }>();
  const { data: user } = useUser(id);
  // The position timeline is one of the container's sections now (after Organization), so it scrolls
  // with the rest of the profile and has its place in the sidebar.
  return (
    <div className="h-full min-h-0">
      <PersonalInfoContainer user={user}/>
    </div>
  );
}
