"use client";

import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { useUpdateDepartment } from "@/components/modules/settings/modules/departments/hooks/useUpdateDepartment/useUpdateDepartment";
import type { DepartmentTreeNode } from "@/models/departments";

type Props = {
  open: boolean;
  onClose: () => void;
  department: DepartmentTreeNode;
  parentOptions: DepartmentTreeNode[];
};

const validationSchema = Yup.object({
  name: Yup.string().trim().required("Name is required"),
  code: Yup.string().trim().nullable(),
  description: Yup.string().trim().nullable(),
  parentId: Yup.string().nullable(),
});

export function EditDepartmentModal({ open, onClose, department, parentOptions }: Props) {
  const updateDepartment = useUpdateDepartment();

  const formik = useFormik({
    initialValues: {
      name: department.name,
      code: department.code ?? "",
      description: department.description ?? "",
      parentId: department.parentId ?? "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      await updateDepartment.mutateAsync({
        id: department.id,
        name: values.name.trim(),
        code: values.code?.trim() || null,
        description: values.description?.trim() || null,
        parentId: values.parentId || null,
      });
      onClose();
    },
  });

  useEffect(() => {
    if (!open) formik.resetForm();
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formik.handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Edit department</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-dept-name">Name *</Label>
            <Input
              id="edit-dept-name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-xs text-red-500">{formik.errors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-dept-code">Code</Label>
            <Input
              id="edit-dept-code"
              name="code"
              value={formik.values.code}
              onChange={formik.handleChange}
              placeholder="e.g. ENG"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-dept-description">Description</Label>
            <Input
              id="edit-dept-description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              placeholder="Optional description"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-dept-parent">Parent department</Label>
            <select
              id="edit-dept-parent"
              name="parentId"
              value={formik.values.parentId}
              onChange={formik.handleChange}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              <option value="">None (root)</option>
              {parentOptions
                .filter((d) => d.status === "ACTIVE" && d.id !== department.id)
                .map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
            </select>
          </div>

          {updateDepartment.isError && (
            <p className="text-sm text-red-500">
              {(updateDepartment.error as Error)?.message ?? "An error occurred."}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={updateDepartment.isPending}>
            Cancel
          </Button>
          <Button onClick={() => formik.handleSubmit()} disabled={updateDepartment.isPending}>
            {updateDepartment.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
