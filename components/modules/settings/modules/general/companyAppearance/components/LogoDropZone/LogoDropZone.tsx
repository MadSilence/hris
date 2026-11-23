"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Alert02Icon, Upload01Icon } from "@hugeicons/core-free-icons";

import { Icon } from "@/components/desact/icon";
import { NodRing } from "@/components/desact/nod";
import { cn } from "@/lib/cn";

/** What the backend takes as a logo (`CompanyLogoUploadValidator`): PNG, JPEG or WebP, up to 5 MB. */
export const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const LOGO_MAX_BYTES = 5 * 1024 * 1024;

export const acceptableLogo = (file: File): boolean =>
  (LOGO_TYPES as readonly string[]).includes(file.type) && file.size > 0 && file.size <= LOGO_MAX_BYTES;

type Props = {
  companyName: string;
  logoUrl: string | null;
  /** The name of the file uploaded in this visit, when there is one; else the logo reads as "Your logo". */
  fileName: string | null;
  /** The file being uploaded right now. */
  uploading: string | null;
  refused: boolean;
  /** View only, or no right to change the logo: the tile alone, no drop, no Remove. */
  readOnly: boolean;
  onFile: (file: File) => void;
  onRemove: () => void;
};

/**
 * Step 1 (sign-in-appearance § Layout, L1/L4): a dashed drop zone with the logo tile — a logo without its own
 * background always sits on white — its name, "Drop a new one or choose a file." and Remove. Uploads and saves at
 * once; no Save. Shared in spirit with first-run-welcome's drop zone, which is the photo's.
 */
export function LogoDropZone({ companyName, logoUrl, fileName, uploading, refused, readOnly, onFile, onRemove }: Props) {
  const t = useTranslations("settings.appearance.logo");
  const input = React.useRef<HTMLInputElement>(null);
  const [over, setOver] = React.useState(false);

  const choose = () => input.current?.click();
  const take = (file: File | undefined) => {
    if (file) onFile(file);
  };

  const chooseLink = (chunks: React.ReactNode) => (
    <button type="button" onClick={choose} className="text-accent-text underline underline-offset-4 hover:no-underline">
      {chunks}
    </button>
  );

  const letter = (companyName.trim()[0] ?? "").toUpperCase();

  // The tile (L1, L1-NoLogo, L6b): white 56, radius 12, a hairline. Without a logo it shows the upload icon where a
  // file can be dropped, and the company's first letter where it cannot (view only).
  const tile = (
    <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-tint border border-divider bg-card appearance-logo-letter text-accent-text">
      {uploading ? (
        <NodRing />
      ) : logoUrl ? (
        // A backend-hosted upload of unknown size; next/image would need a remote pattern for the API origin.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" className="max-h-10 max-w-10 object-contain" />
      ) : readOnly ? (
        letter
      ) : (
        <Icon icon={Upload01Icon} size="lg" className="text-tertiary" />
      )}
    </span>
  );

  // View only (L6-ReadOnly, L6b): the tile and the logo's name — nothing to drop, no hint.
  if (readOnly) {
    return (
      <div className="flex items-center gap-4 rounded-card border border-divider p-4">
        {tile}
        <p className="m-0 text-body font-semibold text-primary">
          {logoUrl ? fileName ?? t("current") : t("named", { company: companyName })}
        </p>
      </div>
    );
  }

  const [title, hint] = uploading
    ? [t("uploading", { file: uploading }), t("uploadingHint")]
    : over
      ? [t("over"), t("overHint")]
      : logoUrl
        ? [fileName ?? t("current"), t.rich("replaceHint", { choose: chooseLink })]
        : [t("empty"), t.rich("emptyHint", { company: companyName, choose: chooseLink })];

  return (
    <div className="flex flex-col gap-2">
      <div
        role="group"
        aria-label={t("region")}
        aria-busy={uploading ? true : undefined}
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          take(event.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex items-center gap-4 rounded-card border-[1.5px] border-dashed p-4 transition-colors",
          refused ? "border-status-declined-fill" : over ? "border-accent bg-accent-subtle" : "border-strong",
        )}
      >
        {tile}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="m-0 truncate text-body font-semibold text-primary">{title}</p>
          <p className="m-0 text-body text-tertiary">{hint}</p>
        </div>
        {logoUrl && !uploading && !over ? (
          <button type="button" onClick={onRemove} className="shrink-0 text-body font-medium text-danger-text hover:underline">
            {t("remove")}
          </button>
        ) : null}
        <input
          ref={input}
          type="file"
          accept={LOGO_TYPES.join(",")}
          className="hidden"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = "";
            take(file);
          }}
        />
      </div>
      {refused ? (
        <p role="alert" className="m-0 flex items-start gap-1.5 text-label font-normal text-status-declined-text">
          <Icon icon={Alert02Icon} size="sm" className="mt-px shrink-0" />
          {t("refused")}
        </p>
      ) : !logoUrl ? (
        <p className="m-0 text-label font-normal text-tertiary">{t("sizeHint")}</p>
      ) : null}
    </div>
  );
}
