import { hrisApiAuthService } from "@/api/modules/auth/services/hrisAuthService";
import type { EmailChangePeekResponse } from "@/api/modules/auth/dto";
import { ConfirmEmailContainer } from "@/components/modules/emailChange";
import { messageForError } from "@/lib/errors/errorMessages";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

/**
 * Where the link sent to a new email address lands. The link is looked up here, on the server, without
 * being used — so a used or expired one says so instead of offering a button that cannot succeed.
 */
export default async function ConfirmEmailPage({ searchParams }: Props) {
  const { token } = await searchParams;

  let peek: EmailChangePeekResponse | null = null;
  let problem: string | null = null;

  if (!token) {
    problem = "This confirmation link is incomplete. Open the link from your email again.";
  } else {
    try {
      peek = await hrisApiAuthService.peekEmailChange(token);
    } catch (error) {
      problem = messageForError(error);
    }
  }

  if (!token || !peek) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-page-title">This link doesn&apos;t work</h1>
        <p className="text-body text-tertiary">{problem}</p>
      </div>
    );
  }

  return <ConfirmEmailContainer token={token} firstName={peek.firstName} newEmail={peek.newEmail} />;
}
