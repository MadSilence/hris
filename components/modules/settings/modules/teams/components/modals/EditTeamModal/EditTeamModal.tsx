"use client";

import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { useUpdateTeam } from "@/components/modules/settings/modules/teams/hooks/useUpdateTeam/useUpdateTeam";
import {
  UserPickerField,
  type PickedUser,
} from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import type { TeamTreeNode } from "@/models/teams";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { FormError } from "@/components/feedback/FormError";
import { FieldError } from "@/components/desact/field-error";

const ROOT_VALUE = "none";

type SharedTranslator = ReturnType<typeof useTranslations<"structure.shared">>;

type Props = {
  open: boolean;
  onClose: () => void;
  team: TeamTreeNode;
  parentOptions: TeamTreeNode[];
};

const buildValidationSchema = (tShared: SharedTranslator) => Yup.object({
  name: Yup.string().trim().required(tShared("nameRequired")),
  code: Yup.string().trim().nullable(),
  description: Yup.string().trim().nullable(),
  parentId: Yup.string().nullable(),
});

export function EditTeamModal({ open, onClose, team, parentOptions }: Props) {
  const t = useTranslations("structure.teams");
  const tShared = useTranslations("structure.shared");
  const tCommon = useTranslations("common");
  const validationSchema = useMemo(() => buildValidationSchema(tShared), [tShared]);
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
        // `team` is the node captured when the dialog opened, so this is the version the form was
        // filled from; a save over a newer row comes back as E00409 and the dialog stays.
        version: team.version,
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
          <DialogTitle>{t("edit.title", { name: team.name })}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <RequiredLabel htmlFor="edit-team-name" required>{tCommon("fields.name")}</RequiredLabel>
            <Input
              id="edit-team-name"
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
            <Label htmlFor="edit-team-code">{tShared("code")}</Label>
            <Input
              id="edit-team-code"
              name="code"
              value={formik.values.code}
              onChange={formik.handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-team-description">{tCommon("fields.description")}</Label>
            <Input
              id="edit-team-description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-team-parent">{t("labels.parent")}</Label>
            <SearchableSelect
              id="edit-team-parent"
              options={[{ value: ROOT_VALUE, label: tCommon("values.none") }, ...activeOptions.map((n) => ({ value: n.id, label: n.name }))]}
              value={formik.values.parentId || ROOT_VALUE}
              onChange={(v) => formik.setFieldValue("parentId", !v || v === ROOT_VALUE ? "" : v)}
              clearable={false}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("labels.lead")}</Label>
            <UserPickerField value={lead} onChange={setLead} placeholder={tShared("searchPerson")} />
          </div>

          {updateTeam.isError && (
            <FormError message={(updateTeam.error as Error)?.message ?? tShared("errorOccurred")} />
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
            {tCommon("actions.cancel")}
          </Button>
          <Button type="button" onClick={() => formik.handleSubmit()} disabled={busy}>
            {busy ? tCommon("actions.saving") : tCommon("actions.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
