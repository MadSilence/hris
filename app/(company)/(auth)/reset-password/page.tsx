import Link from "next/link";
import { hrisApiAuthService } from "@/api/modules/auth/services/hrisAuthService";
import type { PasswordResetPeekResponse } from "@/api/modules/auth/dto";
import { ResetPasswordContainer } from "@/components/modules/passwordReset";
import { buttonVariants } from "@/components/desact/button";
import { getTranslations } from "next-intl/server";
import { messageForError } from "@/lib/errors/errorMessages";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

/**
 * Where a password reset link lands. The link is looked up here, on the server, without being used —
 * so an expired or already-used one says so, and offers a new one, instead of a form that cannot
 * succeed.
 */
export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;
  const t = await getTranslations("auth");

  let peek: PasswordResetPeekResponse | null = null;
  let problem: string | null = null;

  if (!token) {
    problem = t("passwordReset.reset.linkIncomplete");
  } else {
    try {
      peek = await hrisApiAuthService.peekPasswordReset(token);
    } catch (error) {
      problem = messageForError(error);
    }
  }

  if (!token || !peek) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-page-title">{t("links.brokenTitle")}</h1>
        <p className="text-body text-tertiary">{problem}</p>
        {/* The button's look without its Slot: this is a server component. */}
        <Link href="/forgot-password" className={buttonVariants()}>{t("passwordReset.reset.requestNewLink")}</Link>
      </div>
    );
  }

  return <ResetPasswordContainer token={token} firstName={peek.firstName} codeRequired={peek.codeRequired === true} />;
}
