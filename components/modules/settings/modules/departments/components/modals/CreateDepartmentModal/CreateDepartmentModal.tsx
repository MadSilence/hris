"use client";

import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { useCreateDepartment } from "@/components/modules/settings/modules/departments/hooks/useCreateDepartment/useCreateDepartment";
import {
  UserPickerField,
  type PickedUser,
} from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import type { DepartmentTreeNode } from "@/models/departments";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { FormError } from "@/components/feedback/FormError";
import { FieldError } from "@/components/desact/field-error";

const ROOT_VALUE = "none";

type Props = {
  open: boolean;
  onClose: () => void;
  parentOptions: DepartmentTreeNode[];
  defaultParentId?: string | null;
};

const validationSchema = Yup.object({
  name: Yup.string().trim().required("Name is required"),
  code: Yup.string().trim().nullable(),
  description: Yup.string().trim().nullable(),
  parentId: Yup.string().nullable(),
});

export function CreateDepartmentModal({ open, onClose, parentOptions, defaultParentId }: Props) {
  const createDepartment = useCreateDepartment();
  const [lead, setLeadUser] = useState<PickedUser | null>(null);

  const formik = useFormik({
    initialValues: { name: "", code: "", description: "", parentId: defaultParentId ?? "" },
    validationSchema,
    onSubmit: async (values) => {
      await createDepartment.mutateAsync({
        name: values.name.trim(),
        code: values.code?.trim() || null,
        description: values.description?.trim() || null,
        parentId: values.parentId || null,
        leadId: lead?.id ?? null,
      });
      onClose();
    },
  });

  useEffect(() => {
    if (open) {
      formik.resetForm();
      setLeadUser(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formik.handleSubmit();
    }
  };

  const activeOptions = parentOptions.filter((d) => d.status === "ACTIVE");
  const busy = createDepartment.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent onKeyDown={handleKeyDown} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create department</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <RequiredLabel htmlFor="dept-name" required>Name</RequiredLabel>
            <Input
              id="dept-name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.name && formik.errors.name && (
              <FieldError>{formik.errors.name}</FieldError>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dept-code">Code</Label>
            <Input
              id="dept-code"
              name="code"
              value={formik.values.code}
              onChange={formik.handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dept-description">Description</Label>
            <Input
              id="dept-description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dept-parent">Parent department</Label>
            <SearchableSelect
              id="dept-parent"
              options={[{ value: ROOT_VALUE, label: "None" }, ...activeOptions.map((n) => ({ value: n.id, label: n.name }))]}
              value={formik.values.parentId || ROOT_VALUE}
              onChange={(v) => formik.setFieldValue("parentId", !v || v === ROOT_VALUE ? "" : v)}
              clearable={false}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Department lead</Label>
            <UserPickerField value={lead} onChange={setLeadUser} placeholder="Search for a person" />
          </div>

          {createDepartment.isError && (
            <FormError message={(createDepartment.error as Error)?.message ?? "An error occurred."} />
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="button" onClick={() => formik.handleSubmit()} disabled={busy}>
            {busy ? "Adding…" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
