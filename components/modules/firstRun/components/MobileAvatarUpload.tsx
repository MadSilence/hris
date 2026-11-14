"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Tick02Icon } from "@hugeicons/core-free-icons";

import { Avatar, AvatarFallback } from "@/components/desact/avatar";
import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { Progress } from "@/components/desact/progress";
import { uploadAvatarByTokenAction } from "@/components/modules/firstRun/actions";
import { ActionStatus } from "@/components/models/ActionStatus";

/**
 * The phone's side of the code (first-run-photo P6–P9): one big button in thumb reach that opens the phone's
 * **gallery** — the input asks for an image, not the camera, so the picker offers the library (and the camera beside
 * it, the phone's own choice). Then the upload, and its answer.
 *
 * <p>It says the first name and the company and nothing else about anybody. A stolen code should be worth a photo on
 * one profile, not a directory.
 */
export const MobileAvatarUpload: React.FC<{ token: string; firstName: string | null; lastName?: string | null; company: string }> = ({
  token,
  firstName,
  lastName = null,
  company,
}) => {
  const t = useTranslations("firstRun");
  const input = React.useRef<HTMLInputElement>(null);
  const [state, setState] = React.useState<"idle" | "uploading" | "done" | "failed">("idle");
  const [progress, setProgress] = React.useState(0);

  // A server action has no upload events: the bar moves on its own towards the end and completes with the answer.
  React.useEffect(() => {
    if (state !== "uploading") return;
    setProgress(15);
    const timer = setInterval(() => setProgress((p) => Math.min(90, p + (90 - p) / 6)), 400);
    return () => clearInterval(timer);
  }, [state]);

  const pick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setState("uploading");
    const form = new FormData();
    form.append("token", token);
    form.append("file", file);

    const res = await uploadAvatarByTokenAction(form);
    setState(res.status === ActionStatus.SUCCESS ? "done" : "failed");
  };

  const initials = [firstName, lastName].map((part) => part?.trim()[0]?.toUpperCase() ?? "").join("") || "—";

  if (state === "done" || state === "failed") {
    const key = state === "done" ? "done" : "failed";
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        {state === "done" && (
          <span className="flex size-14 items-center justify-center rounded-pill bg-accent-subtle text-accent-text">
            <Icon icon={Tick02Icon} size="lg" />
          </span>
        )}
        <h1 className="text-auth-title text-primary">{t(`mobileAvatar.${key}.title`)}</h1>
        <p className="text-auth-lead text-secondary">{t(`mobileAvatar.${key}.body`)}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60dvh] flex-col items-center gap-6 text-center">
      <Avatar className="size-28">
        <AvatarFallback name={[firstName, lastName].filter(Boolean).join(" ")} className="text-page-title">{initials}</AvatarFallback>
      </Avatar>

      {state === "uploading" ? (
        <div className="flex w-full flex-col items-center gap-4">
          <h1 className="text-auth-title text-primary">{t("mobileAvatar.uploading.title")}</h1>
          <p className="text-auth-lead text-secondary">{t("mobileAvatar.uploading.body")}</p>
          <Progress value={progress} className="max-w-xs" />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <h1 className="text-auth-title text-primary">
              {firstName ? t("mobileAvatar.greeting", { name: firstName }) : t("mobileAvatar.greetingNoName")}
            </h1>
            <p className="text-auth-lead text-secondary">{t("mobileAvatar.lead", { company })}</p>
          </div>
          <div className="mt-auto flex w-full flex-col items-center gap-2">
            <Button type="button" size="lg" className="w-full" onClick={() => input.current?.click()}>
              {t("mobileAvatar.choose")}
            </Button>
            <p className="text-hint text-tertiary">{t("mobileAvatar.fromGallery")}</p>
          </div>
        </>
      )}

      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={pick}
      />
    </div>
  );
};
