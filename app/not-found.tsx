import Link from "next/link";
import { Button } from "@/public/desact/src/components/ui/button";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-svh items-center justify-center p-8">
      <div className="flex max-w-xl flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brown-50">
          <SearchX className="h-8 w-8 text-brown-600"/>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-[var(--color-text-tertiary)]">404</p>

          <h1 className="text-3xl font-semibold">Page not found</h1>

          <p className="text-[var(--color-text-tertiary)]">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="flex gap-3">
          <Button asChild>
            <Link href="/dashboard" className="no-underline">
              Back to dashboard
            </Link>
          </Button>

          <Button asChild variant="secondary">
            <Link href="/" className="no-underline">
              Go home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
