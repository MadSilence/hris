"use client";

import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { DatePicker } from "@/components/ui/DatePicker";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import { createUserAction } from "@/components/modules/organization/components/AddPerson/actions/createUserAction";

type Props = {
  open: boolean;
  onCloseAction: () => void;
};

type Values = { firstName: string; lastName: string; email: string; hireDate: string };

const validationSchema = Yup.object({
  firstName: Yup.string().trim().required("Enter a first name."),
  lastName: Yup.string().trim().required("Enter a last name."),
  email: Yup.string().trim().email("Enter a valid email address."),
  hireDate: Yup.string(),
});

/**
 * Adds a person from two fields.
 *
 * The result is a **draft**: a record with a name, not an employee, not in the directory, and with no
 * invitation sent. So the dialog does not leave the reader on a list the person is missing from — it
 * opens the new profile, which is where *Invite* lives.
 *
 * A hire date today or earlier enters somebody already working here; a later one, or none, somebody
 * who has not started (LIFECYCLE_PROCESSES_DESIGN § 2).
 */
export function AddPersonModal({ open, onCloseAction }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik<Values>({
    initialValues: { firstName: "", lastName: "", email: "", hireDate: "" },
    validationSchema,
    onSubmit: async (values, helpers) => {
      setError(null);
      const res = await createUserAction({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim() || null,
        hireDate: values.hireDate || null,
      });
      if (res.status !== ActionStatus.SUCCESS || !res.data) {
        if (res.fieldErrors?.email) helpers.setFieldError("email", res.fieldErrors.email);
        else setError(res.errorMessage ?? null);
        return;
      }
      onCloseAction();
      router.push(`/organization/people/${res.data.id}/personal`);
    },
  });

  useEffect(() => {
    if (open) {
      formik.resetForm();
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const busy = formik.isSubmitting;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formik.handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !busy) onCloseAction(); }}>
      <DialogContent onKeyDown={handleKeyDown} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Person</DialogTitle>
          <DialogDescription>
            A name is enough. The person is added as a draft and invited when you decide to.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <RequiredLabel htmlFor="person-first-name" required>First Name</RequiredLabel>
              <Input
                id="person-first-name"
                name="firstName"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={busy}
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <p role="alert" className="text-xs text-destructive">{formik.errors.firstName}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <RequiredLabel htmlFor="person-last-name" required>Last Name</RequiredLabel>
              <Input
                id="person-last-name"
                name="lastName"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={busy}
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <p role="alert" className="text-xs text-destructive">{formik.errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="person-email">Email</Label>
            <Input
              id="person-email"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={busy}
            />
            {formik.touched.email && formik.errors.email && (
              <p role="alert" className="text-xs text-destructive">{formik.errors.email}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="person-hire-date">Hire Date</Label>
            <DatePicker
              id="person-hire-date"
              value={formik.values.hireDate}
              onChange={(v) => formik.setFieldValue("hireDate", v)}
              disabled={busy}
              ariaLabel="Hire Date"
            />
          </div>

          <FormError message={error} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCloseAction} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => formik.handleSubmit()} disabled={busy}>
            {busy ? "Adding…" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
