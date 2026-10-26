"use client";

import React from "react";
import { useParams } from "next/navigation";
import { PageGate } from "@/components/auth/PageGate";
import { TemplateCanvasEditor } from "@/components/modules/lifecycle/templates/canvas";

/** Settings → Onboarding → one template, on the canvas. Outside the tab layout: the editor has its own header. */
const OnboardingTemplatePage: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  return (
    <PageGate resource="PEOPLE.LIFECYCLE_TEMPLATES" action="VIEW">
      <TemplateCanvasEditor type="ONBOARDING" templateId={templateId}/>
    </PageGate>
  );
};

export default OnboardingTemplatePage;
