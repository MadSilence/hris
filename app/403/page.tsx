import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { ErrorPage } from "@/components/feedback/ErrorPage";
import { GoBackButton } from "@/components/feedback/GoBackButton";

export default function ForbiddenPage() {
  const t = useTranslations("common");
  return (
    <ErrorPage
      fullScreen
      scene="policies"
      title={t("access.pagePrivate")}
      line={t("access.askAdmin")}
      actions={
        <>
          <Button asChild>
            <Link href="/dashboard">{t("actions.goHome")}</Link>
          </Button>
          <GoBackButton />
        </>
      }
    />
  );
}
