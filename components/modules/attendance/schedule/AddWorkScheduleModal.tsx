"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { Button } from "@/public/desact/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { DatePicker } from "@/components/ui/DatePicker";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal";
import { FormError } from "@/components/feedback/FormError";
import { WEEKDAY_FIELDS, type WeekdayHoursKey, type WorkSchedule, type WorkScheduleWriteRequest } from "@/models/attendance";
import { parseHours } from "@/components/modules/attendance/timesheet/month";

type FormValues = { effectiveFrom: string } & Record<WeekdayHoursKey, string>;

type Props = {
  isOpen: boolean;
  /** The schedule in force today, used as the starting point — a change is usually one day, not seven. */
  current: WorkSchedule | null;
  onCloseAction: () => void;
  /** Resolves to an error message to keep the dialog open with, or `null` when saved. */
  onSubmitAction: (body: WorkScheduleWriteRequest) => Promise<string | null>;
};

const hoursField = yup
  .string()
  .required("Enter the hours, or 0 for a day off.")
  .test("hours", "Hours must be a number between 0 and 24, with at most two decimals.", (value) => {
    const parsed = parseHours(value ?? "");
    return parsed !== null && parsed >= 0 && parsed <= 24 && Math.round(parsed * 100) === parsed * 100;
  });

const schema = yup.object({
  effectiveFrom: yup.string().required("Choose the date the schedule starts."),
  ...Object.fromEntries(WEEKDAY_FIELDS.map((field) => [field.key, hoursField])),
});

const initialValues = (current: WorkSchedule | null): FormValues => {
  const base = { effectiveFrom: "" } as FormValues;
  for (const field of WEEKDAY_FIELDS) {
    const fallback = ["saturdayHours", "sundayHours"].includes(field.key) ? "0" : "8";
    base[field.key] = current ? String(current[field.key]) : fallback;
  }
  return base;
};

/**
 * Adds a work schedule from a date. There is deliberately no edit and no delete: a schedule is
 * effective-dated, and changing the row in force would silently re-price leave already counted under
 * it — a correction is a new schedule from the date it should have started.
 */
export const AddWorkScheduleModal: React.FC<Props> = ({ isOpen, current, onCloseAction, onSubmitAction }) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const formik = useFormik<FormValues>({
    initialValues: initialValues(current),
    enableReinitialize: true,
    validationSchema: schema,
    validateOnChange: false,
    onSubmit: async (values) => {
      setServerError(null);
      const body = { effectiveFrom: values.effectiveFrom } as WorkScheduleWriteRequest;
      for (const field of WEEKDAY_FIELDS) body[field.key] = parseHours(values[field.key]) ?? 0;
      const error = await onSubmitAction(body);
      if (error) {
        setServerError(error);
        return;
      }
      formik.resetForm();
      onCloseAction();
    },
  });

  const requestClose = () => {
    if (formik.isSubmitting) return;
    if (formik.dirty) {
      setConfirmCancel(true);
      return;
    }
    setServerError(null);
    onCloseAction();
  };

  const weeklyTotal = WEEKDAY_FIELDS.reduce((sum, field) => sum + (parseHours(formik.values[field.key]) ?? 0), 0);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) requestClose(); }}>
        <DialogContent hideClose className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Work Schedule</DialogTitle>
            <DialogDescription>
              Hours per weekday from a date on. Zero means the person does not work that day, and leave is
              not charged for it. Earlier schedules stay as they were.
            </DialogDescription>
          </DialogHeader>

          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              void formik.submitForm();
            }}
            className="space-y-4"
          >
            <FormError message={serverError}/>

            <div className="space-y-2">
              <RequiredLabel htmlFor="work-schedule-from" required>Effective From</RequiredLabel>
              <DatePicker
                id="work-schedule-from"
                value={formik.values.effectiveFrom}
                onChange={(value) => void formik.setFieldValue("effectiveFrom", value)}
                clearable={false}
                invalid={Boolean(formik.errors.effectiveFrom)}
              />
              {formik.errors.effectiveFrom && (
                <p className="text-sm text-destructive">{formik.errors.effectiveFrom}</p>
              )}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {WEEKDAY_FIELDS.map((field) => (
                <div key={field.key} className="space-y-1">
                  <Label htmlFor={`work-schedule-${field.key}`} className="text-xs">{field.label}</Label>
                  <Input
                    id={`work-schedule-${field.key}`}
                    inputMode="decimal"
                    value={formik.values[field.key]}
                    onChange={(event) => void formik.setFieldValue(field.key, event.target.value)}
                    aria-invalid={Boolean(formik.errors[field.key]) || undefined}
                    className="h-9 px-2 text-center"
                  />
                </div>
              ))}
            </div>
            {WEEKDAY_FIELDS.some((field) => formik.errors[field.key]) && (
              <p className="text-sm text-destructive">
                {WEEKDAY_FIELDS.map((field) => formik.errors[field.key]).find(Boolean)}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {Number(weeklyTotal.toFixed(2))} hours a week
            </p>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={requestClose} disabled={formik.isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={formik.isSubmitting}
                      className="bg-brown-600 text-white hover:bg-brown-700">
                Add
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmCancelModal
        isOpen={confirmCancel}
        onCancelAction={() => setConfirmCancel(false)}
        onConfirmAction={() => {
          setConfirmCancel(false);
          setServerError(null);
          formik.resetForm();
          onCloseAction();
        }}
      />
    </>
  );
};
