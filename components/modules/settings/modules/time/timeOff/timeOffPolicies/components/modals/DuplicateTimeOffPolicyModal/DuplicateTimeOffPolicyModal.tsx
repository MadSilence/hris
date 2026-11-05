"use client";

import { FC, FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FormError } from "@/components/feedback/FormError";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { RequiredLabel } from "@/components/ui/RequiredLabel";

export interface DuplicateTimeOffPolicyModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  /** The policy being copied; the copy's name starts as "<its name> (copy)". */
  sourceName?: string;
  errorMessage?: string | null;
  onCancelAction: () => void;
  onConfirmAction: (name: string) => void;
}

/**
 * Names the copy of a leave policy. It was a native `window.prompt` — unstyled, and a refusal (a name
 * already taken) had nowhere to be shown but a card after the prompt was gone. The sweep's S3, fixed
 * with the rest of the small items on 2026-10-27.
 */
export const DuplicateTimeOffPolicyModal: FC<DuplicateTimeOffPolicyModalProps> = ({
  isOpen,
  isLoading = false,
  sourceName,
  errorMessage,
  onCancelAction,
  onConfirmAction,
}) => {
  const t = useTranslations("timeOff");
  const tCommon = useTranslations("common");
  const initial = sourceName ? t("policies.duplicate.copyName", { name: sourceName }) : "";
  const [name, setName] = useState(initial);

  useEffect(() => {
    if (isOpen) setName(initial);
  }, [isOpen, initial]);

  const trimmed = name.trim();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || !trimmed) return;
    onConfirmAction(trimmed);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onCancelAction();
      }}
 >
      <DialogContent hideClose className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("policies.duplicate.title")}</DialogTitle>
          <DialogDescription>{t("policies.duplicate.description")}</DialogDescription>
        </DialogHeader>

        <FormError message={errorMessage} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <RequiredLabel htmlFor="duplicate-policy-name" required>{t("policies.duplicate.name")}</RequiredLabel>
            <Input
              id="duplicate-policy-name"
              autoFocus
              value={name}
              disabled={isLoading}
              onChange={(e) => setName(e.currentTarget.value)}
            />
          </div>

          <DialogFooter className="mt-8">
            <Button type="button" variant="secondary" disabled={isLoading} onClick={onCancelAction}>
              {tCommon("actions.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !trimmed}
 >
              {tCommon("actions.duplicate")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
