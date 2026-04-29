import Link from "next/link";
import { Button } from "@/public/desact/src/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-8">
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

        <div className="flex gap-3">
          <Button asChild>
            <Link href="/dashboard" className="no-underline">
              Back to dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
