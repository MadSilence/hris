import Link from "next/link";
import { Button } from "@/components/desact/button";
import { ErrorPage } from "@/components/feedback/ErrorPage";
import { GoBackButton } from "@/components/feedback/GoBackButton";

export default function ForbiddenPage() {
  return (
    <ErrorPage
      fullScreen
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
