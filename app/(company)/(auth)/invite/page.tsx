import { hrisApiAuthService } from "@/api/modules/auth/services/hrisAuthService";
import type { InvitePeekResponse } from "@/api/modules/auth/dto";
import { InviteAcceptContainer } from "@/components/modules/invitation";
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

  let invite: InvitePeekResponse | null = null;
  let problem: string | null = null;

  if (!token) {
    problem = "This invitation link is incomplete. Open the link from your email again.";
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
        <h1 className="text-page-title">This invitation doesn&apos;t work</h1>
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
