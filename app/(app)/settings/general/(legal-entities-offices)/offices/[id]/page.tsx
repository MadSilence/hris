"use client";

import React from "react";
import { useParams } from "next/navigation";
import LegalEntityDetailsContainer
  from "@/components/modules/settings/modules/legalEntity/components/LegalEntityDetailsPage/LegalEntityDetailsContainer";

export default function LegalEntityDetailsPage() {
  const params = useParams<{ id: string }>();

  return <LegalEntityDetailsContainer legalEntityId={params.id}/>;
}
