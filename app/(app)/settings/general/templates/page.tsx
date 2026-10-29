"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import { PageGate } from "@/components/auth/PageGate";
import { TemplatesCatalogue } from "@/components/modules/settings/modules/templates";
import type { TemplateKind } from "@/api/modules/templates/dto";

const KINDS: TemplateKind[] = ["FIELD_SET", "ROLE", "PROCESS"];

/**
 * Settings → General → Templates — the "quick setup" corner beside Import and Export
 * (TEMPLATES_DESIGN.md § 4.3). Readable to whoever may see roles, attributes or lifecycle templates; the
 * list itself holds only the kinds the reader may apply.
 */
// `useSearchParams` (the kind the attributes page links with) needs a Suspense boundary under the App Router.
export default function TemplatesSettingsPage() {
  return (
    <Suspense fallback={null}>
      <TemplatesSettings/>
    </Suspense>
  );
}

function TemplatesSettings() {
  const kindParam = useSearchParams().get("kind");
  const kind = KINDS.find((k) => k === kindParam);

  return (
    <PageGate
      anyOf={[
        { resource: "ROLES.ROLE", action: "VIEW" },
        { resource: "PEOPLE.ATTRIBUTES", action: "VIEW" },
        { resource: "PEOPLE.LIFECYCLE_TEMPLATES", action: "VIEW" },
      ]}
    >
      <div className="space-y-6 px-8 pb-10">
        <div className="space-y-4">
          <SettingsPageHeader title="Templates" backHref="/settings"/>
          <PageDescription className="text-base text-muted-foreground/90">
            Ready-made roles, profile fields and onboarding checklists. Open one to see exactly what it would
            create in your company, adjust it, and apply it as a copy you can change afterwards.
          </PageDescription>
        </div>
        <TemplatesCatalogue kind={kind}/>
      </div>
    </PageGate>
  );
}
