"use client";

import * as React from "react";
import "@/styles/globals.css";
import { fontVariables } from "@/styles/fonts/fonts";
import Link from "next/link";
import { Button } from "@/components/desact/button";
import { ErrorPage } from "@/components/feedback/ErrorPage";

/**
 * The last net: an error thrown in the root layout itself, where `app/(app)/error.tsx` cannot reach. Next.js
 * renders this instead of the whole document, so it brings its own `<html>` and stylesheet — and no workspace
 * accent, which the root layout would have read: the default noddo accent is what the person sees.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  React.useEffect(() => {
    console.error("Unhandled error in the root layout:", error, error.digest ?? "");
  }, [error]);

  return (
    <html lang="en" data-theme="light" className={fontVariables}>
      <body>
        <ErrorPage
          fullScreen
          scene="something-broke"
          title="Something broke on our side"
          line="Try again in a moment."
          reference={error.digest}
          actions={
            <>
              <Button type="button" onClick={reset}>
                Try again
              </Button>
              <Button asChild variant="secondary">
                <Link href="/">Go to home</Link>
              </Button>
            </>
          }
        />
      </body>
    </html>
  );
}
