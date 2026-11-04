import Link from "next/link";
import { Button } from "@/components/desact/button";
import { ErrorPage } from "@/components/feedback/ErrorPage";
import { GoBackButton } from "@/components/feedback/GoBackButton";
import { Illustration } from "@/components/illustrations/Illustration";

/**
 * A refusal shown where the data was going to be.
 *
 * `compact` is the same sentence sized for a tab, a panel or a modal body: a small illustration and no actions —
 * the reader has not left anywhere, only one region of the page is missing, and offering to send them home from
 * inside a tab is a non sequitur. The full version is SPEC § 12's 403 inside the shell.
 */
export function AccessDenied({ compact = false }: { compact?: boolean } = {}) {
  if (compact) {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 px-4 py-8 text-center">
        <Illustration scene="policies" size="s" />
        <div className="flex flex-col gap-1">
          <p className="text-card-title text-primary">This is private</p>
          <p className="text-body text-secondary">Ask an admin for access.</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorPage
      scene="policies"
      title="This page is private"
      line="Ask an admin for access."
      actions={
        <>
          <Button asChild>
            <Link href="/dashboard">Go to home</Link>
          </Button>
          <GoBackButton />
        </>
      }
    />
  );
}
