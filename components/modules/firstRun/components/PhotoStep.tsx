"use client";

import * as React from "react";
import QRCode from "qrcode";
import { useTranslations } from "next-intl";
import { Tick02Icon } from "@hugeicons/core-free-icons";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import { Button } from "@/components/desact/button";
import { FieldError } from "@/components/desact/field-error";
import { Icon } from "@/components/desact/icon";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showActionError } from "@/lib/errors/errorToast";
import { issueAvatarUploadTokenAction } from "@/components/modules/firstRun/actions";
import { uploadUserAvatarAction } from "@/components/modules/organization/modules/profile/actions/uploadUserAvatarAction";
import { SkipButton } from "./FirstRunPieces";

const ACCEPT = "image/png,image/jpeg,image/webp";

const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "—";

type Mode =
  | { kind: "pick" }
  | { kind: "qr"; dataUrl: string; expiresAt: number; avatarWhenShown: string }
  | { kind: "expired" };

/**
 * The welcome's photo (first-run-welcome W2, first-run-photo P2–P5): a drop zone on a computer — drag a photo in, or
 * choose a file, or show a code and pick a photo on the phone — and one *Upload a photo* on a phone.
 *
 * <p><b>The boring path never disappears.</b> The code is the pleasant way and the file picker is the way that always
 * works — no phone, a locked-down device, a video call where nobody wants to hold a phone up.
 *
 * <p>While the code is on screen the profile is polled, so the photo lands by itself (P3): the phone has no way to
 * tell this tab it is finished. The photo arriving is what retires the code — the token is spent by the upload.
 *
 * <p>No *Continue* until there is a photo; the upload buttons and *Skip* are the only actions before it.
 */
export function PhotoStep({
  userId,
  fullName,
  avatarUrl,
  onRefreshAction,
  onContinueAction,
  onSkipAction,
}: {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  /** Re-reads the person, so a photo uploaded from the phone shows here. */
  onRefreshAction: () => void;
  onContinueAction: () => void;
  onSkipAction: () => void;
}) {
  const t = useTranslations("firstRun");
  const tCommon = useTranslations("common");
  const fileInput = React.useRef<HTMLInputElement>(null);
  const [mode, setMode] = React.useState<Mode>({ kind: "pick" });
  const [uploading, setUploading] = React.useState(false);
  const [issuing, setIssuing] = React.useState(false);
  const [over, setOver] = React.useState(false);
  const [refused, setRefused] = React.useState<string | null>(null);
  const [cameFrom, setCameFrom] = React.useState<"phone" | "file" | null>(null);

  // The code retires itself when its fifteen minutes are up (P4) rather than staying on screen to be scanned.
  React.useEffect(() => {
    if (mode.kind !== "qr") return;
    const timer = setTimeout(() => setMode({ kind: "expired" }), Math.max(0, mode.expiresAt - Date.now()));
    return () => clearTimeout(timer);
  }, [mode]);

  // The phone cannot tell this tab anything, so the tab asks — only while the code is up.
  React.useEffect(() => {
    if (mode.kind !== "qr") return;
    const poll = setInterval(() => onRefreshAction(), 3000);
    return () => clearInterval(poll);
  }, [mode.kind, onRefreshAction]);

  // A new avatar address while the code is up is the phone finishing (P3).
  React.useEffect(() => {
    if (mode.kind === "qr" && (avatarUrl ?? "") !== mode.avatarWhenShown) {
      setCameFrom("phone");
      setMode({ kind: "pick" });
    }
  }, [mode, avatarUrl]);

  const showCode = async () => {
    setIssuing(true);
    setRefused(null);
    const res = await issueAvatarUploadTokenAction();
    setIssuing(false);
    if (res.status !== ActionStatus.SUCCESS || !res.data) {
      showActionError(res);
      return;
    }
    // The company's own host, which is the only address this token is any use on.
    const url = `${window.location.origin}/m/avatar?token=${encodeURIComponent(res.data.token)}`;
    const dataUrl = await QRCode.toDataURL(url, { width: 336, margin: 1 });
    setMode({ kind: "qr", dataUrl, expiresAt: Date.now() + res.data.expiresInSeconds * 1000, avatarWhenShown: avatarUrl ?? "" });
  };

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setRefused(null);
    setUploading(true);
    const res = await uploadUserAvatarAction({ userId, file });
    setUploading(false);
    if (res.status !== ActionStatus.SUCCESS) {
      // A refused file is the drop zone's own error, beside it — not a card that slides away.
      setRefused(res.errorMessage ?? null);
      return;
    }
    setCameFrom("file");
    setMode({ kind: "pick" });
    onRefreshAction();
  };

  const choose = () => fileInput.current?.click();
  const hasPhoto = Boolean(avatarUrl);

  const avatar = (
    <span className="relative inline-flex">
      <Avatar className="size-28">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={fullName} className="fr-arrived" /> : null}
        <AvatarFallback name={fullName} className="text-page-title">{initialsOf(fullName)}</AvatarFallback>
      </Avatar>
      {hasPhoto && (
        <span className="absolute bottom-1 right-1 flex size-7 items-center justify-center rounded-pill border-2 border-card bg-accent text-on-accent">
          <Icon icon={Tick02Icon} size="sm" />
        </span>
      )}
    </span>
  );

  return (
    <div className="flex flex-col gap-6">
      <div
        className="fr-drop"
        data-over={over}
        data-invalid={Boolean(refused)}
        aria-busy={uploading || undefined}
        onDragOver={(e) => {
          if (mode.kind !== "pick") return;
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          if (mode.kind !== "pick") return;
          e.preventDefault();
          setOver(false);
          void upload(e.dataTransfer.files?.[0]);
        }}
      >
        {mode.kind === "qr" ? (
          <>
            <span className="fr-qr">
              {/* eslint-disable-next-line @next/next/no-img-element -- a data: URL drawn in this browser */}
              <img src={mode.dataUrl} alt={t("photo.qr.alt")} />
            </span>
            <p className="text-card-title font-medium text-primary">{t("photo.qr.title")}</p>
            <p className="max-w-sm text-body text-secondary">{t("photo.qr.body")}</p>
            <button type="button" className="fr-skip" onClick={() => { setMode({ kind: "pick" }); choose(); }}>
              {t("photo.qr.chooseInstead")}
            </button>
          </>
        ) : mode.kind === "expired" ? (
          <>
            {avatar}
            <p className="text-card-title font-medium text-primary">{t("photo.expired.title")}</p>
            <p className="max-w-sm text-body text-secondary">{t("photo.expired.body")}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button type="button" variant="secondary" onClick={choose} loading={uploading}>{t("photo.chooseFile")}</Button>
              <Button type="button" variant="secondary" onClick={showCode} loading={issuing}>{t("photo.expired.newCode")}</Button>
            </div>
          </>
        ) : (
          <>
            {avatar}
            {hasPhoto ? (
              <>
                <p className="text-card-title font-medium text-primary">{t("photo.arrived.title")}</p>
                <p className="text-body text-secondary">
                  {cameFrom === "phone" ? t("photo.arrived.fromPhone") : t("photo.arrived.fromFile")}
                </p>
              </>
            ) : (
              <>
                <p className="text-card-title font-medium text-primary">
                  {uploading ? t("photo.uploading") : over ? t("photo.drop") : t("photo.drag")}
                </p>
                <p className="text-hint text-tertiary">{t("photo.rules")}</p>
                <p className="hidden text-hint text-tertiary md:block">{t("photo.or")}</p>
              </>
            )}
            {/* A computer: a file or the phone. A phone: its own picker, one button (Q-20). */}
            <div className="hidden flex-wrap justify-center gap-3 md:flex">
              <Button type="button" variant="secondary" onClick={choose} loading={uploading} loadingLabel={t("photo.uploading")}>
                {hasPhoto ? t("photo.arrived.chooseAnother") : t("photo.chooseFile")}
              </Button>
              <Button type="button" variant="secondary" onClick={showCode} loading={issuing}>{t("photo.fromPhone")}</Button>
            </div>
            <div className="md:hidden">
              <Button type="button" variant="secondary" onClick={choose} loading={uploading} loadingLabel={t("photo.uploading")}>
                {t("photo.uploadPhoto")}
              </Button>
            </div>
          </>
        )}
        <FieldError>{refused}</FieldError>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          void upload(file);
        }}
      />

      <div className="flex flex-col gap-3">
        {hasPhoto && mode.kind === "pick" && (
          <Button type="button" size="lg" className="w-full" onClick={onContinueAction}>
            {tCommon("actions.continue")}
          </Button>
        )}
        <SkipButton onClick={onSkipAction} />
      </div>
    </div>
  );
}
