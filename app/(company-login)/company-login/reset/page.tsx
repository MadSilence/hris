import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LinkSquare02Icon } from "@hugeicons/core-free-icons";

import { hrisApiAuthService } from "@/api/modules/auth/services/hrisAuthService";
import type { PasswordResetPeekResponse } from "@/api/modules/auth/dto";
import { companyAuthBrand } from "@/api/modules/companyAddress";
import { ResetPasswordContainer } from "@/components/modules/passwordReset";
import { AuthHeading, AuthSplit } from "@/components/modules/auth/layout";
import { buttonVariants } from "@/components/desact/button";

type Props = { searchParams: Promise<{ token?: string }> };

/**
 * `/login/reset?token=…` on a company's address — where the reset email lands (sign-in-password F3–F8). The link is
 * looked up here without being used, so a dead one says so (F8) instead of offering a form that cannot succeed.
 */
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;
  const t = await getTranslations("auth");
  const { brand } = await companyAuthBrand();

  let peek: PasswordResetPeekResponse | null = null;
  if (token) {
    try {
      peek = await hrisApiAuthService.peekPasswordReset(token);
    } catch {
      peek = null;
    }
  }

  if (!token || !peek) {
    return (
      <AuthSplit brand={brand}>
        <AuthHeading icon={LinkSquare02Icon} title={t("reset.brokenTitle")} lead={t("reset.brokenBody")} />
        <Link href="/login/forgot" className={buttonVariants({ size: "lg", className: "w-full" })}>{t("reset.requestNew")}</Link>
      </AuthSplit>
    );
  }

  return (
    <ResetPasswordContainer
      brand={brand}
      token={token}
      email={peek.email}
      codeRequired={peek.codeRequired === true}
      connectedProviders={peek.connectedProviders ?? []}
    />
  );
}
