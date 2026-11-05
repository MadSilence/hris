"use client";

import { useTranslations } from "next-intl";
import React from "react";
import { useParams } from "next/navigation";
import { PageGate } from "@/components/auth/PageGate";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import RoleDetailsContainer from "@/components/modules/settings/modules/roles/components/RoleDetailsContainer/RoleDetailsContainer";
import { useRoles } from "@/components/modules/settings/modules/roles/hooks/useRoles";
import { ErrorState } from "@/components/feedback/ErrorState";
import { NotFoundError } from "@/components/clients/exceptions";

export default function RolePage() {
  const t = useTranslations("settings");
  const params = useParams<{ id: string }>();
  const roleId = params?.id as string;
  const { data: roles } = useRoles();
  const role = (roles ?? []).find((r) => r.id === roleId);
  const roleName = role?.name ?? t("pages.roleDetail.fallbackName");

  /* The name came from the list and the body was drawn regardless, so a role that no longer exists —
     a deep link from a notification about a role since deleted — rendered an empty page titled
     "Role", with tabs and an Assign button that could only fail. */
  if (roles && !role) {
    return (
      <PageGate resource="ROLES.ROLE" action="VIEW">
        <ErrorState
          error={new NotFoundError(t("pages.roleDetail.notFoundTitle"), { status: 404 })}
          title={t("pages.roleDetail.notFoundTitle")}
          message={t("pages.roleDetail.notFoundMessage")}
        />
      </PageGate>
    );
  }

  return (
    <PageGate resource="ROLES.ROLE" action="VIEW">
      <div className="space-y-4">
        <div className="px-8">
          <SettingsPageHeader title={roleName} backHref="/settings/people/roles"/>
        </div>

        <RoleDetailsContainer roleId={roleId}/>
      </div>
    </PageGate>
  );
}
