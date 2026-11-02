"use client";

import React from "react";
import { useParams } from "next/navigation";
import { PageGate } from "@/components/auth/PageGate";
import { TemplateCanvasEditor } from "@/components/modules/lifecycle/templates/canvas";

/** Settings → Offboarding → one template, on the canvas, its days counted from the last working day. */
const OffboardingTemplatePage: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  return (
    <PageGate resource="PEOPLE.LIFECYCLE_TEMPLATES" action="VIEW">
      <TemplateCanvasEditor type="OFFBOARDING" templateId={templateId}/>
    </PageGate>
  );
};

export default OffboardingTemplatePage;
