"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Camera01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { NodRing } from "@/components/desact/nod";

import { Button } from "@/components/desact/button";
import { uploadAvatarByTokenAction } from "@/components/modules/firstRun/actions";
import { ActionStatus } from "@/components/models/ActionStatus";
import { FormError } from "@/components/feedback/FormError";

/**
 * One button, on a phone.
 *
 * <p>Everything about this page is shaped by where it is opened: a phone somebody has just scanned a
 * code with, one-handed, possibly on a lift. So there is one control, it is large, and `capture`
 * asks for the camera directly rather than the photo library — the person came here to take a photo,
 * and the library is still one tap away in the sheet the browser opens.
 *
 * <p>It says the first name and nothing else about anybody. A stolen code should be worth a photo on
 * one profile, not a directory.
 */
export const MobileAvatarUpload: React.FC<{ token: string; firstName: string | null }> = ({
  token,
  firstName,
}) => {
  const t = useTranslations("firstRun");
  const input = React.useRef<HTMLInputElement>(null);
  const [state, setState] = React.useState<"idle" | "uploading" | "done">("idle");
  const [problem, setProblem] = React.useState<string | null>(null);

  const pick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setProblem(null);
    setState("uploading");
    const form = new FormData();
    form.append("token", token);
    form.append("file", file);

    const res = await uploadAvatarByTokenAction(form);
    if (res.status !== ActionStatus.SUCCESS) {
      setState("idle");
      // Shown on the page, not in a toast: on a phone a card that slides away is a card that is missed.
      setProblem(res.errorMessage ?? t("mobileAvatar.failed"));
      return;
    }
    setState("done");
  };

  if (state === "done") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-pill bg-status-approved-bg">
          <Icon icon={Tick02Icon} size="lg" className="text-status-approved-text" />
        </div>
        <h1 className="text-section-title text-primary">{t("mobileAvatar.done.title")}</h1>
        <p className="text-tertiary">
          {t("mobileAvatar.done.body")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div>
        <h1 className="text-section-title text-primary">
          {firstName ? t("mobileAvatar.greeting", { name: firstName }) : t("mobileAvatar.title")}
        </h1>
        <p className="mt-1 text-tertiary">{t("mobileAvatar.lead")}</p>
      </div>

      <Button type="button"
        size="lg"
        className="h-14 w-full max-w-xs gap-2 text-body"
        onClick={() => input.current?.click()}
        disabled={state === "uploading"}
      >
        {state === "uploading" ? (
          <NodRing size="md" label="" />
        ) : (
          <Icon icon={Camera01Icon} />
        )}
        {state === "uploading" ? t("mobileAvatar.uploading") : t("mobileAvatar.takePhoto")}
      </Button>

      {problem && <FormError message={problem} className="max-w-xs" />}

      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        capture="user"
        className="hidden"
        onChange={pick}
      />
    </div>
  );
};
