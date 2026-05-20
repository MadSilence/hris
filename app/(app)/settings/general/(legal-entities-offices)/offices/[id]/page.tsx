"use client";

import React from "react";
import { useParams } from "next/navigation";

import OfficeDetailsContainer from "@/components/modules/settings/modules/office/components/OfficeDetailsContainer/OfficeDetailsContainer";

export default function OfficeDetailsPage() {
  const params = useParams<{ id: string }>();

  return <OfficeDetailsContainer officeId={params.id}/>;
}
