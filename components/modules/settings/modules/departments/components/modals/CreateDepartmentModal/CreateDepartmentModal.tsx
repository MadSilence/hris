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
import { useCreateDepartment } from "@/components/modules/settings/modules/departments/hooks/useCreateDepartment/useCreateDepartment";
import type { DepartmentTreeNode } from "@/models/departments";

type Props = {
  open: boolean;
  onClose: () => void;
  parentOptions: DepartmentTreeNode[];
};

const validationSchema = Yup.object({
  name: Yup.string().trim().required("Name is required"),
  code: Yup.string().trim().nullable(),
  description: Yup.string().trim().nullable(),
  parentId: Yup.string().nullable(),
});

export function CreateDepartmentModal({ open, onClose, parentOptions }: Props) {
  const createDepartment = useCreateDepartment();

  const formik = useFormik({
    initialValues: { name: "", code: "", description: "", parentId: "" },
    validationSchema,
    onSubmit: async (values) => {
      await createDepartment.mutateAsync({
        name: values.name.trim(),
        code: values.code?.trim() || null,
        description: values.description?.trim() || null,
        parentId: values.parentId || null,
      });
      onClose();
    },
  });

  useEffect(() => {
    if (open) formik.resetForm();
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
          <DialogTitle>Create department</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="dept-name">Name *</Label>
            <Input
              id="dept-name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g. Engineering"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-xs text-red-500">{formik.errors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dept-code">Code</Label>
            <Input
              id="dept-code"
              name="code"
              value={formik.values.code}
              onChange={formik.handleChange}
              placeholder="e.g. ENG"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dept-description">Description</Label>
            <Input
              id="dept-description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              placeholder="Optional description"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dept-parent">Parent department</Label>
            <select
              id="dept-parent"
              name="parentId"
              value={formik.values.parentId}
              onChange={formik.handleChange}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              <option value="">None (root)</option>
              {parentOptions
                .filter((d) => d.status === "ACTIVE")
                .map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
            </select>
          </div>

          {createDepartment.isError && (
            <p className="text-sm text-red-500">
              {(createDepartment.error as Error)?.message ?? "An error occurred."}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={createDepartment.isPending}>
            Cancel
          </Button>
          <Button onClick={() => formik.handleSubmit()} disabled={createDepartment.isPending}>
            {createDepartment.isPending ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
