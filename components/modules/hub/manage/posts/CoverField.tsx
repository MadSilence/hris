"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Image01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { NodRing } from "@/components/desact/nod";
import { hubFileUrl } from "@/models/hub";
import { cn } from "@/lib/cn";
import { HUB_IMAGE_ACCEPT, uploadHubImage } from "../../document";

/**
 * A post's cover (CM05): a 96 high drop area with a dashed border — "Add a cover image (optional)" — and, with an
 * image, the image at 200 high with Replace and Remove on hover. Images go up as hub files (≤ 10 MB, png, jpeg, gif,
 * webp; the backend refuses the rest and the refusal is shown as a card).
 */
export const CoverField: React.FC<{ value: string | null; onChange: (fileId: string | null) => void }> = ({ value, onChange }) => {
  const t = useTranslations("hub");
  const input = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);
  const [over, setOver] = React.useState(false);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    const id = await uploadHubImage(file);
    setBusy(false);
    if (id) onChange(id);
  };

  const picker = (
    <input
      ref={input}
      type="file"
      accept={HUB_IMAGE_ACCEPT}
      className="hidden"
      tabIndex={-1}
      aria-hidden
      onChange={(e) => {
        void upload(e.target.files?.[0]);
        e.target.value = "";
      }}
    />
  );

  if (value) {
    return (
      <div className="group relative h-[200px] overflow-hidden rounded-card">
        {/* eslint-disable-next-line @next/next/no-img-element -- a session-bound hub file */}
        <img src={hubFileUrl(value)} alt={t("news.photo")} className="size-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-scrim opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <Button type="button" variant="secondary" size="sm" loading={busy} onClick={() => input.current?.click()}>
            {t("post.replace")}
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => onChange(null)}>
            {t("post.remove")}
          </Button>
        </div>
        {picker}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void upload(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex h-24 w-full items-center justify-center gap-2 rounded-card border-[1.5px] border-dashed border-field text-body text-secondary transition-colors hover:border-strong hover:bg-subtle",
          over && "border-accent bg-accent-subtle",
        )}
      >
        {busy ? <NodRing size="sm" /> : <Icon icon={Image01Icon} size="md" className="text-tertiary" />}
        {t("post.addCover")}
      </button>
      {picker}
    </>
  );
};
