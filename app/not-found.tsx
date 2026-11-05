import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { ErrorPage } from "@/components/feedback/ErrorPage";
import { GoBackButton } from "@/components/feedback/GoBackButton";

export default function NotFound() {
  const t = useTranslations("navigation");
  const tCommon = useTranslations("common");
  return (
    <ErrorPage
      fullScreen
      scene="no-results"
      title={t("errorPages.notFoundTitle")}
      line={t("errorPages.notFoundLine")}
      actions={
        <>
          <Button asChild>
            <Link href="/dashboard">{tCommon("actions.goHome")}</Link>
          </Button>
          <GoBackButton />
        </>
      }
    />
  );
}
