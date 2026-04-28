"use client";

import { FC, FormEvent, useCallback, useEffect } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";

import { Button } from "@/public/desact/src/components/ui/button";
import { DialogFooter } from "@/public/desact/src/components/ui/dialog";
import { Input } from "@/public/desact/src/components/ui/input";
import { RadioGroup, RadioGroupItem, } from "@/public/desact/src/components/ui/radio-group";
import { cn } from "@/public/desact/src/components/ui/utils";

import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue";
import { usePeopleSearch } from "@/components/modules/organization/hooks/usePeopleSearch";
import { UsersSearchItemDTO } from "@/models/user/fields";

const PAGE_SIZE = 20;

export type RoleRuleType = "include" | "exclude" | "condition";

const RULES: Array<{
  value: RoleRuleType;
  title: string;
  description: string;
  disabled?: boolean;
}> = [
  {
    value: "include",
    title: "Always include",
    description: "These users will always get the role.",
  },
  {
    value: "exclude",
    title: "Always exclude",
    description: "These users will never get the role.",
  },
  {
    value: "condition",
    title: "Condition based rule",
    description: "Build a rule based on user attributes (coming soon).",
    disabled: true,
  },
];

export type AddRoleRuleFormValues = {
  type: RoleRuleType;
  query: string;
  users: UsersSearchItemDTO[];
};

export interface AddRoleRuleFormProps {
  isLoading?: boolean;
  onCancelAction: () => void;
  onDirtyChangeAction?: (isDirty: boolean) => void;
  onSubmitAction: (values: AddRoleRuleFormValues) => void | Promise<void>;
}

const schema = yup.object({
  type: yup
    .mixed<RoleRuleType>()
    .oneOf(["include", "exclude", "condition"])
    .required("Select rule type."),
  query: yup.string().optional(),
  users: yup
    .array()
    .of(yup.mixed<UsersSearchItemDTO>().required())
    .when("type", {
      is: (type: RoleRuleType) => type === "include" || type === "exclude",
      then: (s) => s.min(1, "Please select at least one user."),
      otherwise: (s) => s.optional(),
    }),
});

function displayName(user: UsersSearchItemDTO) {
  const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

  return name.length ? name : user.email;
}

function sanitize(values: AddRoleRuleFormValues): AddRoleRuleFormValues {
  return {
    type: values.type,
    query: values.query.trim(),
    users:
      values.type === "include" || values.type === "exclude"
        ? values.users
        : [],
  };
}

export const AddRoleRuleForm: FC<AddRoleRuleFormProps> = ({
  isLoading = false,
  onCancelAction,
  onDirtyChangeAction,
  onSubmitAction,
}) => {
  const handleFormSubmission = useCallback(
    (values: AddRoleRuleFormValues) => onSubmitAction(sanitize(values)),
    [onSubmitAction],
  );

  const formik = useFormik<AddRoleRuleFormValues>({
    initialValues: {
      type: "include",
      query: "",
      users: [],
    },
    validationSchema: schema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: handleFormSubmission,
  });

  const debouncedQuery = useDebouncedValue(formik.values.query.trim(), 300);
  const queryForApi = debouncedQuery.length >= 2 ? debouncedQuery : null;

  const showUserSearch =
    formik.values.type === "include" || formik.values.type === "exclude";

  const { data, isLoading: isPeopleLoading, error } = usePeopleSearch({
    limit: PAGE_SIZE,
    cursor: null,
    q: showUserSearch ? queryForApi : null,
    sortField: "last_name",
    sortDir: "asc",
    selectedFields: null,
    filters: null,
  } as any);

  if (error) throw error;

  const rows: UsersSearchItemDTO[] = (data?.items ?? []) as any;
  const selectedIds = new Set(formik.values.users.map((user) => user.id));

  useEffect(() => {
    onDirtyChangeAction?.(formik.dirty);
  }, [formik.dirty, onDirtyChangeAction]);

  useEffect(() => {
    void formik.setFieldValue("query", "");
    void formik.setFieldValue("users", []);
    formik.setFieldError("users", undefined);
  }, [formik.values.type]);

  const addUser = (user: UsersSearchItemDTO) => {
    if (selectedIds.has(user.id)) return;

    void formik.setFieldValue("users", [...formik.values.users, user]);
    formik.setFieldError("users", undefined);
  };

  const removeUser = (id: string) => {
    void formik.setFieldValue(
      "users",
      formik.values.users.filter((user) => user.id !== id),
    );
  };

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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[360px_1fr]">
        <div className="space-y-3">
          <div className="text-sm font-medium">Rule type</div>

          <RadioGroup
            value={formik.values.type}
            onValueChange={(value) =>
              formik.setFieldValue("type", value as RoleRuleType)
            }
            className="gap-4"
          >
            {RULES.map((rule) => {
              const disabled = !!rule.disabled || isLoading;

              return (
                <div
                  key={rule.value}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-4 transition-colors",
                    !disabled && "cursor-pointer hover:bg-accent/40",
                    disabled && "cursor-not-allowed opacity-60",
                  )}
                  onClick={() => {
                    if (!disabled) {
                      void formik.setFieldValue("type", rule.value);
                    }
                  }}
                  role="button"
                  aria-disabled={disabled}
                  tabIndex={disabled ? -1 : 0}
                  onKeyDown={(e) => {
                    if (disabled) return;

                    if (e.key === "Enter" || e.key === " ") {
                      void formik.setFieldValue("type", rule.value);
                    }
                  }}
                >
                  <RadioGroupItem value={rule.value} disabled={disabled}/>

                  <div className="grid gap-1">
                    <div className="text-sm font-medium">{rule.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {rule.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </RadioGroup>

          {formik.errors.type && (
            <p className="text-sm text-destructive">
              {String(formik.errors.type)}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {showUserSearch ? (
            <>
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  {formik.values.type === "include"
                    ? "Users to include"
                    : "Users to exclude"}
                </div>

                <Input
                  value={formik.values.query}
                  onChange={(e) =>
                    formik.setFieldValue("query", e.currentTarget.value)
                  }
                  placeholder="Search users (min 2 chars)…"
                  disabled={isLoading}
                />
              </div>

              {formik.errors.users && (
                <p className="text-sm text-destructive">
                  {String(formik.errors.users)}
                </p>
              )}

              {formik.values.users.length > 0 && (
                <div className="space-y-2 rounded-lg border p-3">
                  <div className="text-sm font-medium">Selected users</div>

                  <div className="space-y-2">
                    {formik.values.users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {displayName(user)}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {user.email}
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isLoading}
                          onClick={() => removeUser(user.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 rounded-lg border p-3">
                <div className="text-sm font-medium">Search results</div>

                {isPeopleLoading && (
                  <div className="text-sm text-muted-foreground">Loading...</div>
                )}

                {!isPeopleLoading && rows.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    Search users to add them to the rule.
                  </div>
                )}

                {!isPeopleLoading &&
                  rows.map((user) => {
                    const selected = selectedIds.has(user.id);

                    return (
                      <div
                        key={user.id}
                        className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {displayName(user)}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {user.email}
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isLoading || selected}
                          onClick={() => addUser(user)}
                        >
                          {selected ? "Added" : "Add"}
                        </Button>
                      </div>
                    );
                  })}
              </div>
            </>
          ) : (
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">
              Condition builder will be added next.
            </div>
          )}
        </div>
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

        <Button type="submit" className="text-white" disabled={isLoading}>
          Add rule
        </Button>
      </DialogFooter>
    </form>
  );
};
