import * as React from "react";
import {
  PersonalDocumentsContainer,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/components/PersonalDocumentsContainer/PersonalDocumentsContainer";
import {
  ProfileCapabilityGate,
} from "@/components/modules/organization/modules/profile/components/ProfileCapabilityGate";

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ProfileCapabilityGate userId={id} resource="PEOPLE.DOCUMENTS">
      <PersonalDocumentsContainer userId={id}/>
    </ProfileCapabilityGate>
  );
}
