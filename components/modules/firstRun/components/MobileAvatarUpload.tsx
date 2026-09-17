"use client";

import * as React from "react";
import { Camera, Check, Loader2 } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { uploadAvatarByTokenAction } from "@/components/modules/firstRun/actions";
import { ActionStatus } from "@/components/models/ActionStatus";

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
      setProblem(res.errorMessage ?? "That did not work. Ask for a new code and try again.");
      return;
    }
    setState("done");
  };

  if (state === "done") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-50">
          <Check className="h-7 w-7 text-success-700" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">That&apos;s your photo</h1>
        <p className="text-muted-foreground">
          It is already on your profile. You can close this page and go back to your computer.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          {firstName ? `Hi ${firstName}` : "Add your photo"}
        </h1>
        <p className="mt-1 text-muted-foreground">Take a photo for your profile.</p>
      </div>

      <Button
        size="lg"
        className="h-14 w-full max-w-xs gap-2 text-base"
        onClick={() => input.current?.click()}
        disabled={state === "uploading"}
      >
        {state === "uploading" ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Camera className="h-5 w-5" />
        )}
        {state === "uploading" ? "Uploading" : "Take a Photo"}
      </Button>

      {problem && <p className="max-w-xs text-sm text-destructive">{problem}</p>}

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
