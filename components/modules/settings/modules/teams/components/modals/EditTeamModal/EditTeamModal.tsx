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
import { useUpdateTeam } from "@/components/modules/settings/modules/teams/hooks/useUpdateTeam/useUpdateTeam";
import {
  UserPickerField,
  type PickedUser,
} from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import type { TeamTreeNode } from "@/models/teams";

const ROOT_VALUE = "none";

type Props = {
  open: boolean;
  onClose: () => void;
  team: TeamTreeNode;
  parentOptions: TeamTreeNode[];
};

const validationSchema = Yup.object({
  name: Yup.string().trim().required("Name is required"),
  code: Yup.string().trim().nullable(),
  description: Yup.string().trim().nullable(),
  parentId: Yup.string().nullable(),
});

export function EditTeamModal({ open, onClose, team, parentOptions }: Props) {
  const updateTeam = useUpdateTeam();

  const [lead, setLead] = useState<PickedUser | null>(
    team.lead
      ? {
          id: team.lead.id,
          firstName: team.lead.firstName,
          lastName: team.lead.lastName,
          avatarUrl: team.lead.avatarUrl,
        }
      : null,
  );

  const formik = useFormik({
    initialValues: {
      name: team.name,
      code: team.code ?? "",
      description: team.description ?? "",
      parentId: team.parentId ?? "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      await updateTeam.mutateAsync({
        id: team.id,
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
    if (!open) formik.resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formik.handleSubmit();
    }
  };

  const activeOptions = parentOptions.filter((t) => t.status === "ACTIVE" && t.id !== team.id);
  const busy = updateTeam.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent onKeyDown={handleKeyDown} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit {team.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-team-name">Name *</Label>
            <Input
              id="edit-team-name"
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
            <Label htmlFor="edit-team-code">Code</Label>
            <Input
              id="edit-team-code"
              name="code"
              value={formik.values.code}
              onChange={formik.handleChange}
              placeholder="e.g. PLAT"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-team-description">Description</Label>
            <Input
              id="edit-team-description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              placeholder="Optional description"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-team-parent">Parent team</Label>
            <Select
              value={formik.values.parentId || ROOT_VALUE}
              onValueChange={(v) => formik.setFieldValue("parentId", v === ROOT_VALUE ? "" : v)}
            >
              <SelectTrigger id="edit-team-parent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ROOT_VALUE}>None (root)</SelectItem>
                {activeOptions.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Team lead</Label>
            <UserPickerField value={lead} onChange={setLead} placeholder="Search for a person" />
          </div>

          {updateTeam.isError && (
            <p className="text-sm text-red-500">
              {(updateTeam.error as Error)?.message ?? "An error occurred."}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => formik.handleSubmit()} disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
