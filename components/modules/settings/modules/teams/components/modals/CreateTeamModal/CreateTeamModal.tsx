"use client";

import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";
import { FormError } from "@/components/feedback/FormError";
import { messageForError } from "@/lib/errors/errorMessages";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { useCreateTeam } from "@/components/modules/settings/modules/teams/hooks/useCreateTeam/useCreateTeam";
import {
  UserPickerField,
  type PickedUser,
} from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import type { TeamTreeNode } from "@/models/teams";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { FieldError } from "@/components/desact/field-error";

const ROOT_VALUE = "none";

type SharedTranslator = ReturnType<typeof useTranslations<"structure.shared">>;

type Props = {
  open: boolean;
  onClose: () => void;
  parentOptions: TeamTreeNode[];
  defaultParentId?: string | null;
};

const buildValidationSchema = (tShared: SharedTranslator) => Yup.object({
  name: Yup.string().trim().required(tShared("nameRequired")),
  code: Yup.string().trim().nullable(),
  description: Yup.string().trim().nullable(),
  parentId: Yup.string().nullable(),
});

export function CreateTeamModal({ open, onClose, parentOptions, defaultParentId }: Props) {
  const t = useTranslations("structure.teams");
  const tShared = useTranslations("structure.shared");
  const tCommon = useTranslations("common");
  const validationSchema = useMemo(() => buildValidationSchema(tShared), [tShared]);
  const createTeam = useCreateTeam();
  const [lead, setLead] = useState<PickedUser | null>(null);

  const formik = useFormik({
    initialValues: { name: "", code: "", description: "", parentId: defaultParentId ?? "" },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      await createTeam.mutateAsync({
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
      setLead(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); formik.handleSubmit(); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent onKeyDown={handleKeyDown}>
        <DialogHeader><DialogTitle>{t("create.title")}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <RequiredLabel htmlFor="team-name" required>{tCommon("fields.name")}</RequiredLabel>
            <Input id="team-name" name="name" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            {formik.touched.name && formik.errors.name && <FieldError>{formik.errors.name}</FieldError>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="team-code">{tShared("code")}</Label>
            <Input id="team-code" name="code" value={formik.values.code} onChange={formik.handleChange} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="team-description">{tCommon("fields.description")}</Label>
            <Input id="team-description" name="description" value={formik.values.description} onChange={formik.handleChange} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="team-parent">{t("labels.parent")}</Label>
            <SearchableSelect
              id="team-parent"
              options={[{ value: ROOT_VALUE, label: tCommon("values.none") }, ...parentOptions.filter((t) => t.status === "ACTIVE").map((n) => ({ value: n.id, label: n.name }))]}
              value={formik.values.parentId || ROOT_VALUE}
              onChange={(v) => formik.setFieldValue("parentId", !v || v === ROOT_VALUE ? "" : v)}
              clearable={false}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("labels.lead")}</Label>
            <UserPickerField value={lead} onChange={setLead} placeholder={tShared("searchPerson")} />
          </div>
          <FormError message={createTeam.error ? messageForError(createTeam.error) : null} />
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={createTeam.isPending}>{tCommon("actions.cancel")}</Button>
          <Button type="button" onClick={() => formik.handleSubmit()} disabled={createTeam.isPending}>
            {createTeam.isPending ? tShared("adding") : tCommon("actions.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
