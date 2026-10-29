"use client";

import { FC, FormEvent, useEffect, useState } from "react";
import { FormError } from "@/components/feedback/FormError";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
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
  const initial = sourceName ? `${sourceName} (copy)` : "";
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
          <DialogTitle>Duplicate policy</DialogTitle>
          <DialogDescription>The copy starts as a draft with every setting of the original.</DialogDescription>
        </DialogHeader>

        <FormError message={errorMessage} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <RequiredLabel htmlFor="duplicate-policy-name" required>Name</RequiredLabel>
            <Input
              id="duplicate-policy-name"
              autoFocus
              value={name}
              disabled={isLoading}
              onChange={(e) => setName(e.currentTarget.value)}
            />
          </div>

          <DialogFooter className="mt-8">
            <Button type="button" variant="outline" disabled={isLoading} onClick={onCancelAction}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !trimmed}
              className="bg-brown-600 text-white hover:bg-brown-700"
            >
              Duplicate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
