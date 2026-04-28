"use client";

import { FC, FormEvent, useCallback, useEffect } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";

import { Button } from "@/public/desact/src/components/ui/button";
import { DialogFooter } from "@/public/desact/src/components/ui/dialog";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Switch } from "@/public/desact/src/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/public/desact/src/components/ui/select";

type Template = {
  id: string;
  name: string;
  description?: string;
};

export type AddRoleFormValues = {
  useTemplate: boolean;
  name: string;
  templateId: string;
  templateName: string;
};

export interface AddRoleFormProps {
  isLoading?: boolean;
  templates: Template[];
  onCancelAction: () => void;
  onDirtyChangeAction?: (isDirty: boolean) => void;
  onSubmitAction: (values: AddRoleFormValues) => void | Promise<void>;
}

const schema = yup.object({
  useTemplate: yup.boolean().required(),
  name: yup.string().when("useTemplate", {
    is: false,
    then: (s) =>
      s
        .trim()
        .required("Please enter a role name.")
        .min(2, "Role name must be at least 2 characters.")
        .max(120, "Role name must be at most 120 characters."),
    otherwise: (s) => s.strip(),
  }),
  templateId: yup.string().when("useTemplate", {
    is: true,
    then: (s) => s.required("Please select a template."),
    otherwise: (s) => s.strip(),
  }),
  templateName: yup.string().when("useTemplate", {
    is: true,
    then: (s) => s.trim().max(120, "Role name must be at most 120 characters."),
    otherwise: (s) => s.strip(),
  }),
});

function sanitize(values: AddRoleFormValues): AddRoleFormValues {
  if (!values.useTemplate) {
    return {
      useTemplate: false,
      name: values.name.trim(),
      templateId: "",
      templateName: "",
    };
  }

  return {
    useTemplate: true,
    name: "",
    templateId: values.templateId,
    templateName: values.templateName.trim(),
  };
}

export const AddRoleForm: FC<AddRoleFormProps> = ({
  isLoading = false,
  templates,
  onCancelAction,
  onDirtyChangeAction,
  onSubmitAction,
}) => {
  const handleFormSubmission = useCallback(
    (values: AddRoleFormValues) => onSubmitAction(sanitize(values)),
    [onSubmitAction],
  );

  const formik = useFormik<AddRoleFormValues>({
    initialValues: {
      useTemplate: false,
      name: "",
      templateId: templates[0]?.id ?? "",
      templateName: "",
    },
    enableReinitialize: true,
    validationSchema: schema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: handleFormSubmission,
  });

  useEffect(() => {
    onDirtyChangeAction?.(formik.dirty);
  }, [formik.dirty, onDirtyChangeAction]);

  useEffect(() => {
    if (!formik.values.useTemplate) {
      void formik.setFieldValue("templateName", "");
      formik.setFieldError("templateId", undefined);
      formik.setFieldError("templateName", undefined);
      return;
    }

    void formik.setFieldValue("name", "");
    formik.setFieldError("name", undefined);

    if (!formik.values.templateId && templates[0]?.id) {
      void formik.setFieldValue("templateId", templates[0].id);
    }
  }, [formik.values.useTemplate]);

  const selectedTemplate = templates.find(
    (template) => template.id === formik.values.templateId,
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;

    const errors = await formik.validateForm();

    await formik.setTouched(setNestedObjectValues(errors, true), true);

    if (Object.keys(errors).length > 0) return;

    await formik.submitForm();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 rounded-md bg-brown-50 px-4 py-3">
          <div className="min-w-0">
            <div className="text-sm font-medium">Choose from a template</div>
            <div className="text-xs text-muted-foreground">
              Pick a ready configuration and customize it in the future.
            </div>
          </div>

          <Switch
            checked={formik.values.useTemplate}
            onCheckedChange={(value) =>
              formik.setFieldValue("useTemplate", Boolean(value))
            }
            disabled={isLoading || templates.length === 0}
          />
        </div>

        {!formik.values.useTemplate && (
          <div className="space-y-2">
            <Label htmlFor="role-name">Role name</Label>
            <Input
              id="role-name"
              value={formik.values.name}
              onChange={(e) =>
                formik.setFieldValue("name", e.currentTarget.value)
              }
              placeholder="e.g. HR Manager"
              required
              disabled={isLoading}
              aria-invalid={!!formik.errors.name}
            />
            {formik.errors.name && (
              <p className="text-sm text-destructive">{formik.errors.name}</p>
            )}
          </div>
        )}

        {formik.values.useTemplate && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template</Label>

              <Select
                value={formik.values.templateId}
                onValueChange={(value) =>
                  formik.setFieldValue("templateId", value)
                }
                disabled={isLoading || templates.length === 0}
              >
                <SelectTrigger aria-invalid={!!formik.errors.templateId}>
                  <SelectValue placeholder="Select template"/>
                </SelectTrigger>

                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {formik.errors.templateId && (
                <p className="text-sm text-destructive">
                  {formik.errors.templateId}
                </p>
              )}

              {selectedTemplate && (
                <p className="text-xs text-muted-foreground">
                  {selectedTemplate.description ??
                    "You can edit permissions after creation."}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-role-name">Role name optional</Label>
              <Input
                id="template-role-name"
                value={formik.values.templateName}
                onChange={(e) =>
                  formik.setFieldValue("templateName", e.currentTarget.value)
                }
                placeholder="Leave empty to use template name"
                disabled={isLoading}
                aria-invalid={!!formik.errors.templateName}
              />
              {formik.errors.templateName && (
                <p className="text-sm text-destructive">
                  {formik.errors.templateName}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <DialogFooter className="mt-8">
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={onCancelAction}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isLoading}>
          Create
        </Button>
      </DialogFooter>
    </form>
  );
};
