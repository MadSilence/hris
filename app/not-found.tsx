import Link from "next/link";
import { Button } from "@/components/desact/button";
import { ErrorPage } from "@/components/feedback/ErrorPage";
import { GoBackButton } from "@/components/feedback/GoBackButton";

export default function NotFound() {
  return (
    <ErrorPage
      fullScreen
      scene="no-results"
      title="We can't find this page"
      line="The link may be broken."
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
