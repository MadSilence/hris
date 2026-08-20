"use client";

import { FC, FormEvent, useCallback, useEffect, useState } from "react";
import { Layers } from "lucide-react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";

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
        .required("Please enter a name.")
        .max(255, "Name must be 255 characters or fewer.")
        .test(
          "unique",
          "This name is already taken.",
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
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brown-100 text-brown-700">
                <Layers className="h-5 w-5"/>
              </span>
              <div className="space-y-1">
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {errorMessage && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {errorMessage}
            </p>
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
                <p className="text-sm text-destructive">{formik.errors.name}</p>
              )}
            </div>

            <DialogFooter className="mt-6 border-t border-brown-100 pt-4">
              <Button type="button" variant="outline" disabled={isLoading} onClick={requestClose}>
                Cancel
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
