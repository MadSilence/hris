"use client";

import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { PageDescription } from "@/components/ui/PageDescription/PageDescription";
import { SecuritySettingsForm } from "@/components/modules/mfa/components";
import { IdentitySettings } from "@/components/modules/identity/components";
import { useCanAccess } from "@/components/auth/useAccess";
import { useTranslations } from "next-intl";

/**
 * Login & SSO: sign-in security — two-step sign-in, remembered devices, the idle timeout (MFA_DESIGN.md § 4)
 * — and, behind `SETTINGS.IDENTITY`, single sign-on and provisioning (ENTERPRISE_ACCESS_DESIGN.md § 4.6).
 */
export default function LoginSsoSettingsPage() {
  const t = useTranslations("settings");
  const canIdentity = useCanAccess("SETTINGS.IDENTITY", "MANAGE");
  return (
    <div className="flex flex-col gap-6 px-8">
      <SettingsPageHeader title={t("menu.items.loginSso")} backHref="/settings" />
      <PageDescription>{t("loginSso.description")}</PageDescription>
      <section className="space-y-4">
        <h2 className="text-section-title text-primary">{t("loginSso.signInSecurity")}</h2>
        <SecuritySettingsForm />
      </section>
      {canIdentity && <IdentitySettings />}
    </div>
  );
}
