import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("navigation");
  return (
    <footer className="border-t border-divider bg-card">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row">
        <p className="text-body text-tertiary">
          {t("public.footer.rights", { year: new Date().getFullYear() })}
        </p>

        <ul className="flex items-center gap-6 text-body">
          <li>
            <Link
              href="/#"
              className="text-tertiary hover:text-primary"
            >
              {t("public.footer.privacy")}
            </Link>
          </li>

          <li>
            <Link
              href="/#"
              className="text-tertiary hover:text-primary"
            >
              {t("public.footer.terms")}
            </Link>
          </li>

          <li>
            <Link
              href="/contact"
              className="text-tertiary hover:text-primary"
            >
              {t("public.footer.contact")}
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
