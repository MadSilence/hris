import { hrisApiLifecycleService } from "@/api/modules/lifecycle/services";
import type { PreboardingPage } from "@/models/lifecycle";
import { PreboardingPageContainer } from "@/components/modules/lifecycle/preboarding/PreboardingPageContainer";
import { messageForError } from "@/lib/errors/errorMessages";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

/**
 * Where a preboarding link lands. No account and no session: the token is the credential, and the
 * page is resolved on the server so a link that no longer works says so instead of rendering a form.
 */
export default async function PreboardingRoutePage({ searchParams }: Props) {
  const { token } = await searchParams;

  let page: PreboardingPage | null = null;
  let problem: string | null = null;
  if (!token) {
    problem = "This link is incomplete. Open it from your email again.";
  } else {
    try {
      page = await hrisApiLifecycleService.preboardingView(token);
    } catch (error) {
      problem = messageForError(error);
    }
  }

  if (!token || !page) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-4xl font-medium">Link Not Available</h1>
        <p className="text-md text-muted-foreground">{problem}</p>
        <p className="text-sm text-muted-foreground">
          If you have already set a password, sign in — your remaining tasks are in the app.
        </p>
      </div>
    );
  }

  return <PreboardingPageContainer token={token} initialPage={page} />;
}
