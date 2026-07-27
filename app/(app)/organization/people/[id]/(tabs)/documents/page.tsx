import * as React from "react";
import {
  PersonalDocumentsContainer,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/components/PersonalDocumentsContainer/PersonalDocumentsContainer";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AccessDenied } from "@/components/auth/AccessDenied";

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <PermissionGate resource="PEOPLE.DOCUMENTS" action="VIEW" fallback={<AccessDenied/>}>
      <PersonalDocumentsContainer userId={id}/>
    </PermissionGate>
  );
}
