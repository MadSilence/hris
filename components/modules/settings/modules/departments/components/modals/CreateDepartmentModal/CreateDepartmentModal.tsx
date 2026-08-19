"use client";

import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/public/desact/src/components/ui/select";
import { useCreateDepartment } from "@/components/modules/settings/modules/departments/hooks/useCreateDepartment/useCreateDepartment";
import {
  UserPickerField,
  type PickedUser,
} from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import type { DepartmentTreeNode } from "@/models/departments";

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
            <Select
              value={formik.values.parentId || ROOT_VALUE}
              onValueChange={(v) => formik.setFieldValue("parentId", v === ROOT_VALUE ? "" : v)}
            >
              <SelectTrigger id="dept-parent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ROOT_VALUE}>None (root)</SelectItem>
                {activeOptions.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Department lead</Label>
            <UserPickerField value={lead} onChange={setLeadUser} placeholder="Search for a person" />
          </div>

          {createDepartment.isError && (
            <p className="text-sm text-red-500">
              {(createDepartment.error as Error)?.message ?? "An error occurred."}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => formik.handleSubmit()} disabled={busy}>
            {busy ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
