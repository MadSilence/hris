"use client";

import { FC, FormEvent, useCallback, useEffect, useMemo } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";

import { Button } from "@/public/desact/src/components/ui/button";
import { DialogFooter } from "@/public/desact/src/components/ui/dialog";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Textarea } from "@/public/desact/src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/public/desact/src/components/ui/select";
import { JobFamily, JobLevelGroup } from "@/models/job";

const DESCRIPTION_MAX = 300;
const CODE_MAX = 64;

/** Radix cannot hold an empty string as an item value, so "no level" needs a sentinel. */
export const NO_LEVEL = "__none__";

export type JobFormValues = {
  name: string;
  familyId: string;
  levelId: string;
  code: string;
  description: string;
};

export interface JobFormProps {
  isLoading?: boolean;
  submitLabel: string;
  initialValues?: Partial<JobFormValues>;
  families: JobFamily[];
  levelGroups: JobLevelGroup[];
  isLevelsLoading?: boolean;
  /**
   * Codes already used elsewhere in the company. Checked here so a clash shows before a round-trip;
   * the backend still owns the rule.
   */
  takenCodes?: string[];
  onCancelAction: () => void;
  onDirtyChangeAction?: (isDirty: boolean) => void;
  onSubmitAction: (values: JobFormValues) => void | Promise<void>;
}

const buildValidationSchema = (takenCodes: string[]) => {
  const taken = new Set(takenCodes.map((c) => c.trim().toLowerCase()));

  return yup.object({
    name: yup
      .string()
      .trim()
      .required("Please enter a job name.")
      .max(255, "Name must be 255 characters or fewer."),
    familyId: yup.string().required("Please pick a job family."),
    code: yup
      .string()
      .trim()
      .max(CODE_MAX, `Code must be ${CODE_MAX} characters or fewer.`)
      .test(
        "unique",
        "This code is already used by another job.",
        (value) => !value || !taken.has(value.trim().toLowerCase()),
      ),
    description: yup
      .string()
      .trim()
      .max(DESCRIPTION_MAX, `Description must be ${DESCRIPTION_MAX} characters or fewer.`),
  });
};

export const JobForm: FC<JobFormProps> = ({
  isLoading = false,
  submitLabel,
  initialValues,
  families,
  levelGroups,
  isLevelsLoading = false,
  takenCodes = [],
  onCancelAction,
  onDirtyChangeAction,
  onSubmitAction,
}) => {
  const handleFormSubmission = useCallback(
    (values: JobFormValues) =>
      onSubmitAction({
        ...values,
        name: values.name.trim(),
        code: values.code.trim(),
        description: values.description.trim(),
      }),
    [onSubmitAction],
  );

  const formik = useFormik<JobFormValues>({
    initialValues: {
      name: initialValues?.name ?? "",
      familyId: initialValues?.familyId ?? "",
      levelId: initialValues?.levelId ?? NO_LEVEL,
      code: initialValues?.code ?? "",
      description: initialValues?.description ?? "",
    },
    validationSchema: buildValidationSchema(takenCodes),
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: handleFormSubmission,
  });

  useEffect(() => {
    onDirtyChangeAction?.(formik.dirty);
  }, [formik.dirty, onDirtyChangeAction]);

  // Archived families are still listed on the catalogue screen, but a new position cannot be put
  // into one — it would be born unusable.
  const selectableFamilies = useMemo(
    () => families.filter((f) => !f.archived || f.id === initialValues?.familyId),
    [families, initialValues?.familyId],
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    const errors = await formik.validateForm();
    await formik.setTouched(setNestedObjectValues(errors, true), true);
    if (Object.keys(errors).length > 0) return;

    await formik.submitForm();
  };

  const remaining = DESCRIPTION_MAX - formik.values.description.length;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="job-name">Name</Label>

          <Input
            id="job-name"
            value={formik.values.name}
            onChange={(e) => formik.setFieldValue("name", e.currentTarget.value)}
            placeholder="e.g., Backend Engineer"
            required
            disabled={isLoading}
            aria-invalid={!!formik.errors.name}
          />

          {formik.errors.name && <p className="text-sm text-destructive">{formik.errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="job-family">Family</Label>

            <Select
              value={formik.values.familyId}
              onValueChange={(value) => formik.setFieldValue("familyId", value)}
              disabled={isLoading}
            >
              <SelectTrigger id="job-family" aria-invalid={!!formik.errors.familyId}>
                <SelectValue placeholder="Pick a family"/>
              </SelectTrigger>

              <SelectContent>
                {selectableFamilies.map((family) => (
                  <SelectItem key={family.id} value={family.id}>
                    {family.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {formik.errors.familyId && (
              <p className="text-sm text-destructive">{formik.errors.familyId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-level">Level</Label>

            <Select
              value={formik.values.levelId}
              onValueChange={(value) => formik.setFieldValue("levelId", value)}
              disabled={isLoading || isLevelsLoading}
            >
              <SelectTrigger id="job-level">
                <SelectValue placeholder={isLevelsLoading ? "Loading…" : "No level"}/>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={NO_LEVEL}>No level</SelectItem>

                {levelGroups.map((group) => (
                  <SelectGroup key={group.id}>
                    <SelectLabel>{group.name}</SelectLabel>
                    {group.levels.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="job-code">Code</Label>

          <Input
            id="job-code"
            value={formik.values.code}
            onChange={(e) => formik.setFieldValue("code", e.currentTarget.value)}
            placeholder="Optional — e.g., ENG-BE-03"
            maxLength={CODE_MAX}
            disabled={isLoading}
            aria-invalid={!!formik.errors.code}
          />

          {formik.errors.code && <p className="text-sm text-destructive">{formik.errors.code}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="job-description">Description</Label>

          <Textarea
            id="job-description"
            value={formik.values.description}
            onChange={(e) => formik.setFieldValue("description", e.currentTarget.value)}
            placeholder="A short line about the position"
            rows={3}
            maxLength={DESCRIPTION_MAX}
            disabled={isLoading}
            aria-invalid={!!formik.errors.description}
          />

          <div className="flex items-center justify-between">
            <p className="text-sm text-destructive">{formik.errors.description ?? ""}</p>
            <p className="text-xs text-muted-foreground">{remaining} characters left</p>
          </div>
        </div>
      </div>

      <DialogFooter className="mt-6 border-t border-brown-100 pt-4">
        <Button type="button" variant="outline" disabled={isLoading} onClick={onCancelAction}>
          Cancel
        </Button>

        <Button type="submit" disabled={isLoading}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
};
