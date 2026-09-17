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
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-4xl font-medium">Invitation Not Available</h1>
        <p className="text-md text-muted-foreground">{problem}</p>
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
