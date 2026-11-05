"use client";

import { useTranslations } from "next-intl";
import { FC, FormEvent, useCallback, useEffect, useState } from "react";
import { Layers01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import { FieldError } from "@/components/desact/field-error";
import { InlineAlert } from "@/components/desact/alert";

type Props = {
  isOpen: boolean;
  isLoading: boolean;
  title: string;
  description: string;
  submitLabel: string;
  fieldLabel: string;
  placeholder: string;
  initialName?: string;
  /** Names already taken in the same scope — the company for tracks, the track for grades. */
  existingNames?: string[];
  errorMessage?: string | null;
  onConfirmAction: (name: string) => void;
  onRequestCloseAction: () => void;
};

/**
 * Tracks and grades are both a single name, so they share one dialog rather than four
 * near-identical ones. What differs is the copy and which names are already taken.
 */
export const JobLevelNameModal: FC<Props> = ({
  isOpen,
  isLoading,
  title,
  description,
  submitLabel,
  fieldLabel,
  placeholder,
  initialName,
  existingNames = [],
  errorMessage,
  onConfirmAction,
  onRequestCloseAction,
}) => {
  const t = useTranslations("structure.jobLevels");
  const tCommon = useTranslations("common");
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);

  const taken = new Set(
    existingNames
      .filter((n) => n.trim().toLowerCase() !== (initialName ?? "").trim().toLowerCase())
      .map((n) => n.trim().toLowerCase()),
  );

  const handleFormSubmission = useCallback(
    (values: { name: string }) => onConfirmAction(values.name.trim()),
    [onConfirmAction],
  );

  const formik = useFormik<{ name: string }>({
    initialValues: { name: initialName ?? "" },
    validationSchema: yup.object({
      name: yup
        .string()
        .trim()
        .required(t("validation.nameRequired"))
        .max(255, t("validation.nameMax"))
        .test(
          "unique",
          t("validation.nameTaken"),
          (value) => !value || !taken.has(value.trim().toLowerCase()),
        ),
    }),
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: handleFormSubmission,
  });

  const { resetForm } = formik;
  useEffect(() => {
    if (isOpen) resetForm({ values: { name: initialName ?? "" } });
  }, [isOpen, initialName, resetForm]);

  const requestClose = () => {
    if (isLoading) return;

    if (formik.dirty) {
      setIsConfirmCancelOpen(true);
      return;
    }
    onRequestCloseAction();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    const errors = await formik.validateForm();
    await formik.setTouched(setNestedObjectValues(errors, true), true);
    if (Object.keys(errors).length > 0) return;

    await formik.submitForm();
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) requestClose();
        }}
      >
        <DialogContent hideClose className="gap-5 sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3 text-left">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-popover bg-mist text-secondary">
                <Icon icon={Layers01Icon} />
              </span>
              <div className="space-y-1">
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {errorMessage && (
            <InlineAlert tone="declined">
              {errorMessage}
            </InlineAlert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="job-level-name">{fieldLabel}</Label>

              <Input
                id="job-level-name"
                value={formik.values.name}
                onChange={(e) => formik.setFieldValue("name", e.currentTarget.value)}
                placeholder={placeholder}
                required
                autoFocus
                disabled={isLoading}
                aria-invalid={!!formik.errors.name}
              />

              {formik.errors.name && (
                <FieldError>{formik.errors.name}</FieldError>
              )}
            </div>

            <DialogFooter className="mt-6 border-t border-divider pt-4">
              <Button type="button" variant="secondary" disabled={isLoading} onClick={requestClose}>
                {tCommon("actions.cancel")}
              </Button>

              <Button type="submit" disabled={isLoading}>
                {submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmCancelModal
        isOpen={isConfirmCancelOpen}
        onCancelAction={() => setIsConfirmCancelOpen(false)}
        onConfirmAction={() => {
          setIsConfirmCancelOpen(false);
          onRequestCloseAction();
        }}
      />
    </>
  );
};
