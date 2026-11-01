"use client";

import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { PageDescription } from "@/components/ui/PageDescription/PageDescription";
import { SecuritySettingsForm } from "@/components/modules/mfa/components";
import { IdentitySettings } from "@/components/modules/identity/components";
import { useCanAccess } from "@/components/auth/useAccess";

/**
 * Login & SSO: sign-in security — two-step sign-in, remembered devices, the idle timeout (MFA_DESIGN.md § 4)
 * — and, behind `SETTINGS.IDENTITY`, single sign-on and provisioning (ENTERPRISE_ACCESS_DESIGN.md § 4.6).
 */
export default function LoginSsoSettingsPage() {
  const canIdentity = useCanAccess("SETTINGS.IDENTITY", "MANAGE");
  return (
    <div className="flex flex-col gap-6 px-8">
      <SettingsPageHeader title="Login & SSO" backHref="/settings" />
      <PageDescription>How people sign in to the company, and how long a sign-in lasts.</PageDescription>
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-foreground">Sign-in Security</h2>
        <SecuritySettingsForm />
      </section>
      {canIdentity && <IdentitySettings />}
    </div>
  );
}
