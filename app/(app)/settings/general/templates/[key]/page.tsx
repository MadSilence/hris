"use client";

import { useParams } from "next/navigation";
import { PageGate } from "@/components/auth/PageGate";
import { TemplatePreview } from "@/components/modules/settings/modules/templates";

/** One template: its preview against this company, and applying it (TEMPLATES_DESIGN.md § 4.3). */
export default function TemplatePage() {
  const params = useParams<{ key: string }>();
  const key = decodeURIComponent((params?.key as string) ?? "");
  return (
    <PageGate
      anyOf={[
        { resource: "ROLES.ROLE", action: "EDIT" },
        { resource: "PEOPLE.ATTRIBUTES", action: "EDIT" },
        { resource: "PEOPLE.LIFECYCLE_TEMPLATES", action: "EDIT" },
      ]}
    >
      <TemplatePreview templateKey={key}/>
    </PageGate>
  );
}
