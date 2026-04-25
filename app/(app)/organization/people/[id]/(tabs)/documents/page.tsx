import * as React from "react";
import {
  PersonalDocumentsContainer,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/components/PersonalDocumentsContainer/PersonalDocumentsContainer";

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <PersonalDocumentsContainer userId={id}/>;
}
