"use client";

import { FC, FormEvent, useEffect, useMemo } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";

import { Badge } from "@/public/desact/src/components/ui/badge";
import { Button } from "@/public/desact/src/components/ui/button";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import { DialogFooter } from "@/public/desact/src/components/ui/dialog";

import { Role } from "@/models/role/Role";
import { UsersSearchItemDTO } from "@/models/user/fields";

export type AssignRolesFormValues = {
  roleIds: string[];
};

export interface AssignRolesFormProps {
  isLoading?: boolean;
  user: UsersSearchItemDTO | null;
  allRoles: Role[];
  onCancelAction: () => void;
  onDirtyChangeAction?: (isDirty: boolean) => void;
  onSubmitAction: (values: AssignRolesFormValues) => void | Promise<void>;
}

const schema = yup.object({
  roleIds: yup.array().of(yup.string().required()).required(),
});

function setKey(ids: string[]) {
  return [...new Set(ids)].sort().join("|");
}

function getInitials(
  firstName?: string | null,
  lastName?: string | null,
  email?: string | null,
) {
  const first = (firstName ?? "").trim();
  const last = (lastName ?? "").trim();
  const initials = `${first ? first[0] : ""}${last ? last[0] : ""}`;

  if (initials) return initials.toUpperCase();

  const normalizedEmail = (email ?? "").trim();

  return (normalizedEmail[0] ?? "—").toUpperCase();
}

function getInitialRoleIds(user: UsersSearchItemDTO | null) {
  if (!user) return [];

  return (user.roles ?? []).map((role) => role.id);
}

export const AssignRolesForm: FC<AssignRolesFormProps> = ({
  isLoading = false,
  user,
  allRoles,
  onCancelAction,
  onDirtyChangeAction,
  onSubmitAction,
}) => {
  const initialRoleIds = useMemo(() => getInitialRoleIds(user), [user]);

  const formik = useFormik<AssignRolesFormValues>({
    initialValues: {
      roleIds: initialRoleIds,
    },
    enableReinitialize: true,
    validationSchema: schema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: onSubmitAction,
  });

  const hasChanges = useMemo(
    () => setKey(formik.values.roleIds) !== setKey(initialRoleIds),
    [formik.values.roleIds, initialRoleIds],
  );

  useEffect(() => {
    onDirtyChangeAction?.(hasChanges);
  }, [hasChanges, onDirtyChangeAction]);

  const toggleRole = (roleId: string) => {
    const checked = formik.values.roleIds.includes(roleId);

    void formik.setFieldValue(
      "roleIds",
      checked
        ? formik.values.roleIds.filter((id) => id !== roleId)
        : [...formik.values.roleIds, roleId],
    );
  };

  const handleReset = () => {
    void formik.setFieldValue("roleIds", initialRoleIds);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading || !user || !hasChanges) return;

    const errors = await formik.validateForm();

    await formik.setTouched(setNestedObjectValues(errors, true), true);

    if (Object.keys(errors).length > 0) return;

    await formik.submitForm();
  };

  const fullName =
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
    user?.email ||
    "User";

  const initials = getInitials(user?.firstName, user?.lastName, user?.email);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brown-100">
          <span className="font-semibold text-brown-700">{initials}</span>
        </div>

        <div className="min-w-0">
          <h3 className="truncate font-semibold">{fullName}</h3>

          {user?.email && (
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          )}

          {user?.status && (
            <Badge variant="secondary" className="mt-1">
              {user.status}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {allRoles.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No roles available
          </div>
        ) : (
          allRoles.map((role) => {
            const checked = formik.values.roleIds.includes(role.id);

            return (
              <label
                key={role.id}
                className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-brown-50"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleRole(role.id)}
                  disabled={isLoading}
                />

                <div className="flex min-w-0 items-center gap-2">
                  <div className="truncate text-sm font-medium">
                    {role.name}
                  </div>

                  {role.systemOwner && (
                    <Badge variant="secondary" className="shrink-0">
                      System
                    </Badge>
                  )}
                </div>
              </label>
            );
          })
        )}
      </div>

      <DialogFooter className="mt-8">
        {hasChanges ? (
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={handleReset}
          >
            Reset
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={onCancelAction}
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          disabled={isLoading || !hasChanges || !user}
          className="bg-brown-600 text-white hover:bg-brown-700"
        >
          Apply
        </Button>
      </DialogFooter>
    </form>
  );
};
