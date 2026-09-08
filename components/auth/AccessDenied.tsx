import Link from "next/link";
import { Button } from "@/public/desact/src/components/ui/button";
import { ShieldAlert } from "lucide-react";

/**
 * A refusal shown where the data was going to be.
 *
 * `compact` is the same sentence sized for a tab, a panel or a modal body: no heading rank, no
 * "Back to dashboard" — the reader has not left anywhere, only one region of the page is missing,
 * and offering to send them to the dashboard from inside a tab is a non sequitur.
 */
export function AccessDenied({ compact = false }: { compact?: boolean } = {}) {
  if (compact) {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 px-4 py-8 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brown-50">
          <ShieldAlert className="h-5 w-5 text-brown-600"/>
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">Access denied</p>
          <p className="text-sm text-[var(--color-text-tertiary)]">
            You do not have permission to view this.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="flex max-w-xl flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brown-50">
          <ShieldAlert className="h-8 w-8 text-brown-600"/>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-[var(--color-text-tertiary)]">403</p>

          <h1 className="text-3xl font-semibold">Access denied</h1>

          <p className="text-[var(--color-text-tertiary)]">
            You do not have permission to view this page.
          </p>
        </div>

        <Button asChild>
          <Link href="/dashboard" className="no-underline">
            Back to dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
