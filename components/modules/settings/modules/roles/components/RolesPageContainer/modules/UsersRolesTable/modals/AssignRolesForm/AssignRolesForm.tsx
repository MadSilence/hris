"use client";

import { FC, Fragment, FormEvent, useEffect, useMemo, useState } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";

import { Avatar, AvatarFallback, AvatarImage } from "@/public/desact/src/components/ui/avatar";
import { Badge } from "@/public/desact/src/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/public/desact/src/components/ui/tooltip";
import { Button } from "@/public/desact/src/components/ui/button";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import { DialogFooter } from "@/public/desact/src/components/ui/dialog";

import { Role } from "@/models/role/Role";
import { UsersSearchItemDTO } from "@/models/user/fields";
import { useAccess } from "@/components/auth/useAccess";
import { isSystemOwner } from "@/models/access";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/public/desact/src/components/ui/tabs";
import { useRoleAccessPreview } from "@/components/modules/settings/modules/roles/hooks/useRoleAccessPreview";
import { ResolvedAccessPanel } from "./ResolvedAccessPanel";

export type AssignRolesFormValues = {
  roleIds: string[];
};

type AssignRolesTab = "roles" | "permissions" | "fields";

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
  const { access } = useAccess();
  const iAmOwner = isSystemOwner(access);
  const [tab, setTab] = useState<AssignRolesTab>("roles");

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

  // The default role is always granted but is not a checkbox the admin ticks, so it has to be
  // added explicitly or the preview would understate what the person ends up with.
  const effectiveRoleIds = useMemo(() => {
    const defaults = allRoles.filter((role) => role.isDefault).map((role) => role.id);
    return [...new Set([...formik.values.roleIds, ...defaults])];
  }, [formik.values.roleIds, allRoles]);

  const preview = useRoleAccessPreview(effectiveRoleIds, tab !== "roles");

  /**
   * Archived roles are never offered, but one the person already holds has to stay visible —
   * otherwise the list quietly claims they have fewer roles than they do, and there is no way to
   * take the archived one off them.
   */
  const visibleRoles = useMemo(
    () => allRoles.filter((role) => !role.archived || initialRoleIds.includes(role.id)),
    [allRoles, initialRoleIds],
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
      <div className="mb-8 mt-4 flex items-center gap-4">
        <Avatar className="h-16 w-16 shrink-0">
          {user?.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={fullName} /> : null}
          <AvatarFallback className="bg-brown-100 font-semibold text-brown-700">
            {initials}
          </AvatarFallback>
        </Avatar>

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

      {/* The three tabs answer the two questions an admin has here: which roles, and what those
          roles actually add up to. The preview follows the *selection*, not what is saved. */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as AssignRolesTab)}>
        <TabsList className="grid w-full grid-cols-3 bg-brown-50">
          <TabsTrigger value="roles">Assigned roles</TabsTrigger>
          <TabsTrigger value="permissions">Resolved permissions</TabsTrigger>
          <TabsTrigger value="fields">Resolved field visibility</TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="mt-4 max-h-[320px] overflow-y-auto">
          <ResolvedAccessPanel
            isLoading={preview.isLoading}
            systemOwner={preview.data?.systemOwner ?? false}
            rows={preview.data?.permissions}
            emptyText="These roles grant no module access."
          />
        </TabsContent>

        <TabsContent value="fields" className="mt-4 max-h-[320px] overflow-y-auto">
          <ResolvedAccessPanel
            isLoading={preview.isLoading}
            systemOwner={preview.data?.systemOwner ?? false}
            rows={preview.data?.fields}
            emptyText="These roles grant no access to employee fields."
          />
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
      <TooltipProvider delayDuration={200}>
        <div className="space-y-2">
          {visibleRoles.length === 0 ? (
            <div className="text-sm text-muted-foreground">No roles available</div>
          ) : (
            visibleRoles.map((role) => {
              const checked = formik.values.roleIds.includes(role.id);
              // Default is always on; System Owner can only be granted/revoked by an owner. An
              // archived role can be taken away but never put back — unticking it is the only
              // move left, so the box locks again once it is clear.
              const locked =
                role.isDefault
                || (role.systemOwner && !iAmOwner)
                || (role.archived && !checked);
              const lockMsg = role.isDefault
                ? "Default role — always assigned and can’t be removed"
                : role.systemOwner && !iAmOwner
                  ? "Only a System Owner can grant or remove this role"
                  : role.archived
                    ? "This role is archived — it grants nothing and cannot be assigned again"
                    : null;

              const row = (
                <label
                  className={`flex items-center gap-3 rounded-md px-2 py-2 ${
                    locked ? "cursor-default" : "cursor-pointer hover:bg-brown-50"
                  }`}
                >
                  <Checkbox
                    checked={role.isDefault ? true : checked}
                    onCheckedChange={() => {
                      if (!locked) toggleRole(role.id);
                    }}
                    disabled={isLoading || locked}
                  />

                  <div className="flex min-w-0 items-center gap-2">
                    <div className="truncate text-sm font-medium">{role.name}</div>

                    {role.systemOwner && (
                      <Badge variant="secondary" className="shrink-0">System</Badge>
                    )}

                    {role.isDefault && (
                      <Badge variant="secondary" className="shrink-0">Default</Badge>
                    )}

                    {role.archived && (
                      <Badge variant="outline" className="shrink-0">Archived</Badge>
                    )}
                  </div>
                </label>
              );

              return (
                <Fragment key={role.id}>
                  {lockMsg ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{row}</TooltipTrigger>
                      <TooltipContent>{lockMsg}</TooltipContent>
                    </Tooltip>
                  ) : (
                    row
                  )}
                </Fragment>
              );
            })
          )}
        </div>
      </TooltipProvider>
        </TabsContent>
      </Tabs>

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
