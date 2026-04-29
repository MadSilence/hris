"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type SettingsPageHeaderProps = {
  title: string;
  backHref?: string;
};

export default function SettingsPageHeader({
  title,
  backHref,
}: SettingsPageHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex items-center gap-4">
      {backHref ? (
        <Link
          href={backHref}
          className="no-underline grid h-10 w-10 place-items-center rounded-full border bg-white hover:bg-brown-50 active:translate-y-px"
        >
          <ChevronLeft className="h-4 w-4"/>
        </Link>
      ) : (
        <button
          onClick={() => router.back()}
          className="grid h-10 w-10 place-items-center rounded-full border bg-white hover:bg-brown-50 active:translate-y-px"
        >
          <ChevronLeft className="h-4 w-4"/>
        </button>
      )}

      <h1 className="text-3xl font-semibold">{title}</h1>
    </header>
  );
}

function ChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...props}>
      <path
        d="M15 18l-6-6 6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
