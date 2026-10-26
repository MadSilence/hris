"use client";

import React from "react";
import { useParams } from "next/navigation";
import { PageGate } from "@/components/auth/PageGate";
import { TemplateCanvasEditor } from "@/components/modules/lifecycle/templates/canvas";

/** Settings → Preboarding → one template, on the canvas. Outside the tab layout: the editor has its own header. */
const PreboardingTemplatePage: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  return (
    <PageGate resource="PEOPLE.LIFECYCLE_TEMPLATES" action="VIEW">
      <TemplateCanvasEditor type="PREBOARDING" templateId={templateId}/>
    </PageGate>
  );
};

export default PreboardingTemplatePage;
