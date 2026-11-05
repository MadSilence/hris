import { hrisApiAuthService } from "@/api/modules/auth/services/hrisAuthService";
import type { InvitePeekResponse } from "@/api/modules/auth/dto";
import { InviteAcceptContainer } from "@/components/modules/invitation";
import { getTranslations } from "next-intl/server";
import { messageForError } from "@/lib/errors/errorMessages";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

/**
 * Where an invitation link lands. The link is looked up here, on the server, without being used — so
 * an expired or already-used one says so instead of offering a form that cannot succeed.
 */
export default async function InvitePage({ searchParams }: Props) {
  const { token } = await searchParams;
  const t = await getTranslations("auth");

  let invite: InvitePeekResponse | null = null;
  let problem: string | null = null;

  if (!token) {
    problem = t("invitation.linkIncomplete");
  } else {
    try {
      invite = await hrisApiAuthService.peekInvite(token);
    } catch (error) {
      problem = messageForError(error);
    }
  }

  if (!token || !invite) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-page-title">{t("invitation.brokenTitle")}</h1>
        <p className="text-body text-tertiary">{problem}</p>
      </div>
    );
  }

  return (
    <InviteAcceptContainer
      token={token}
      firstName={invite.firstName}
      email={invite.email}
      companyName={invite.companyName}
    />
  );
}
