"use client";

import { showError } from "@/lib/errors/errorToast";
import { messageForError } from "@/lib/errors/errorMessages";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building03Icon, Download01Icon, Location01Icon, Mail01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { Button } from "@/components/desact/button";
import { Badge } from "@/components/desact/badge";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { Textarea } from "@/components/desact/textarea";
import { Separator } from "@/components/desact/separator";
import { Checkbox } from "@/components/desact/checkbox";
import { HolidayCalendarBindingSection } from "@/components/modules/settings/modules/time/publicHolidays/components/HolidayCalendarBinding";

import { useOffice } from "@/components/modules/settings/modules/office/hooks/useOffice";
import { useUpdateOfficeAction } from "@/components/modules/settings/modules/office/hooks/useUpdateOfficeAction";
import { useDeleteOfficeAction } from "@/components/modules/settings/modules/office/hooks/useDeleteOfficeAction";
import {
  useArchiveOfficeAction,
  useRestoreOfficeAction,
} from "@/components/modules/settings/modules/office/hooks/useArchiveOfficeAction";
import type { AssignedUsersStrategy } from "@/components/modules/settings/modules/office/actions/archiveOfficeAction";
import { DeleteOfficeModal } from "@/components/modules/settings/modules/office/components/modals/DeleteOfficeModal";
import { ArchiveOfficeModal } from "@/components/modules/settings/modules/office/components/modals/ArchiveOfficeModal";
import { OfficeSkeleton } from "@/components/modules/settings/modules/office/components/OfficeDetailsContainer/OfficeSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/desact/tabs";
import OfficeAssignedUsersTab from "@/components/modules/settings/modules/office/components/OfficeAssignedUsersTab/OfficeAssignedUsersTab";

import { ActionStatus } from "@/components/models/ActionStatus";
import { PermissionGate } from "@/components/auth/PermissionGate";
import type { Office } from "@/models/office";
import {
  ExportDataModal,
  ExportDataFormValues,
  triggerExportDownload,
} from "@/components/modules/settings/shared/ExportDataModal";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { ForbiddenError } from "@/components/clients/exceptions";
import { useDetachedPeopleImpact } from "@/components/modules/settings/shared/DetachedPeopleNotice";
import { StatusBadge } from "@/components/ui/StatusBadge";

const SCROLL_OFFSET = "calc(100svh - 390px)";

type Props = {
  officeId: string;
};

type FormValues = {
  name: string;
  description: string;
  country: string;
  city: string;
  street: string;
  building: string;
  postCode: string;
  email: string;
  phone: string;
  isRemote: boolean;
};

type TextField = Exclude<keyof FormValues, "isRemote">;

type SectionTitleProps = {
  icon: ReactNode;
  title: string;
};

type FieldProps = {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
};

const mapOffice = (office: Office): FormValues => ({
  name: office.name ?? "",
  description: office.description ?? "",
  country: office.country ?? "",
  city: office.city ?? "",
  street: office.street ?? "",
  building: office.building ?? "",
  postCode: office.postCode ?? "",
  email: office.email ?? "",
  phone: office.phone ?? "",
  isRemote: office.isRemote ?? false,
});

export default function OfficeDetailsContainer({ officeId }: Props) {
  const router = useRouter();

  const { data, isLoading, error } = useOffice();
  const updateAction = useUpdateOfficeAction();
  const deleteAction = useDeleteOfficeAction();
  const archiveAction = useArchiveOfficeAction();
  const restoreAction = useRestoreOfficeAction();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  // Who deleting detaches, asked only while the Delete dialog is open.
  const deleteImpact = useDetachedPeopleImpact("offices", officeId, isDeleteOpen);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [values, setValues] = useState<FormValues | null>(null);
  const [openedVersion, setOpenedVersion] = useState<number | undefined>(undefined);

  const office = useMemo(
    () => (data ?? []).find((item) => item.id === officeId),
    [data, officeId],
  );

  useEffect(() => {
    if (updateAction.data?.status !== ActionStatus.SUCCESS) return;

    setIsEditing(false);
    setValues(null);
  }, [updateAction.data?.status]);

  useEffect(() => {
    if (archiveAction.data?.status !== ActionStatus.SUCCESS) return;

    setIsArchiveOpen(false);
    setIsEditing(false);
    setValues(null);
  }, [archiveAction.data?.status]);

  useEffect(() => {
    if (deleteAction.data?.status !== ActionStatus.SUCCESS) return;

    router.push("/settings/general/offices");
  }, [deleteAction.data?.status, router]);
  if (error instanceof ForbiddenError) return <AccessDenied/>;
  if (error) return <ErrorState error={error} />;

  if (isLoading) {
    return <OfficeSkeleton/>;
  }

  if (!office) {
    return (
      <div className="px-8 py-6 text-body text-tertiary">
        Office not found
      </div>
    );
  }

  const current = values ?? mapOffice(office);
  const isArchived = office.archived;

  const handleArchive = (strategy: AssignedUsersStrategy) => {
    archiveAction.mutate({ id: office.id, assignedUsersStrategy: strategy });
  };

  const handleRestore = () => {
    restoreAction.mutate(office.id);
  };

  const updateField = (key: TextField, value: string) => {
    setValues((prev) => ({
      ...(prev ?? mapOffice(office)),
      [key]: value,
    }));
  };

  const updateRemote = (value: boolean) => {
    setValues((prev) => ({
      ...(prev ?? mapOffice(office)),
      isRemote: value,
    }));
  };

  // The form is opened here, so its values and its version are taken together at this moment. A
  // background refetch while the user types must not swap in a newer version under older values —
  // that is precisely the overwrite the version exists to refuse.
  const handleEdit = () => {
    updateAction.reset();
    setValues(mapOffice(office));
    setOpenedVersion(office.version);
    setIsEditing(true);
  };

  const handleSave = () => {
    updateAction.mutate({
      id: office.id,
      isSystem: office.isSystem,
      ...current,
      version: openedVersion,
    });
  };

  const handleCancel = () => {
    updateAction.reset();
    setIsEditing(false);
    setValues(null);
  };

  // The action answers with an envelope rather than throwing, so a refusal (E00409 among them) is
  // in `data`; `error` is only a failure to reach the action at all. Either way the form stays open.
  const saveError =
    updateAction.data?.status === ActionStatus.ERROR
      ? updateAction.data.errorMessage
      : updateAction.error
        ? messageForError(updateAction.error)
        : null;

  const handleExport = async ({ format }: ExportDataFormValues) => {
    try {
      await triggerExportDownload(`/api/offices/${office.id}/export`, format);
      setIsExportOpen(false);
    } catch (error) {
      console.error("Failed to export office:", error);
    }
  };

  return (
    <div className="space-y-6 px-8">
      <SettingsPageHeader
        title={office.name}
        backHref="/settings/general/offices"
      />

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Icon icon={Building03Icon} size="sm" />
            General information
          </TabsTrigger>
          <TabsTrigger value="assigned" className="flex items-center gap-2">
            <Icon icon={UserGroupIcon} size="sm" />
            Assigned users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-8">
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-section-title text-primary">General information</h2>
                  {isArchived && (
                    <StatusBadge status="archived" className="font-normal" />
                  )}
                  {office.isRemote && (
                    <Badge variant="neutral" className="font-normal">
                      Remote
                    </Badge>
                  )}
                </div>
                <p className="text-body text-tertiary">
                  Contact and address details for this office.
                </p>
              </div>

              <div className="flex flex-none items-center gap-3">
                {isEditing ? (
                  <>
                    <PermissionGate resource="ORG.OFFICE" action="EDIT">
                      <Button type="button"
                        variant="secondary"
                        onClick={() => setIsArchiveOpen(true)}
                        disabled={updateAction.isPending || archiveAction.isPending}
                      >
                        Archive
                      </Button>
                    </PermissionGate>
                    <PermissionGate resource="ORG.OFFICE" action="MANAGE">
                      <Button type="button"
                        variant="secondary"
                        onClick={() => setIsDeleteOpen(true)}
                        disabled={deleteAction.isPending}
                      >
                        Delete
                      </Button>
                    </PermissionGate>
                    <Button type="button"
                      variant="secondary"
                      onClick={handleCancel}
                      disabled={updateAction.isPending}
                    >
                      Cancel
                    </Button>
                    <Button type="button" onClick={handleSave} disabled={updateAction.isPending}>
                      Save changes
                    </Button>
                  </>
                ) : isArchived ? (
                  <>
                    <PermissionGate resource="ORG.OFFICE" action="EDIT">
                      <Button type="button" onClick={handleRestore} disabled={restoreAction.isPending}>
                        Unarchive
                      </Button>
                    </PermissionGate>
                    <PermissionGate resource="ORG.OFFICE" action="MANAGE">
                      <Button type="button"
                        variant="secondary"
                        onClick={() => setIsDeleteOpen(true)}
                        disabled={deleteAction.isPending}
                      >
                        Delete
                      </Button>
                    </PermissionGate>
                    <PermissionGate resource="ORG.OFFICE" action="EDIT">
                      <Button type="button"
                        size="icon"
                        variant="secondary"
                        aria-label="Export office"
                        onClick={() => setIsExportOpen(true)}
                      >
                        <Icon icon={Download01Icon} size="sm" />
                      </Button>
                    </PermissionGate>
                  </>
                ) : (
                  <>
                    <PermissionGate resource="ORG.OFFICE" action="EDIT">
                      <Button type="button" onClick={handleEdit}>Edit</Button>
                    </PermissionGate>
                    <PermissionGate resource="ORG.OFFICE" action="EDIT">
                      <Button type="button"
                        size="icon"
                        variant="secondary"
                        aria-label="Export office"
                        onClick={() => setIsExportOpen(true)}
                      >
                        <Icon icon={Download01Icon} size="sm" />
                      </Button>
                    </PermissionGate>
                  </>
                )}
              </div>
            </div>

            {isEditing && <FormError message={saveError}/>}

            <div className="space-y-8 overflow-y-auto px-1" style={{ maxHeight: SCROLL_OFFSET }}>
              <div className="space-y-5">
        <SectionTitle icon={<Icon icon={Building03Icon} />} title="General"/>

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Name"
            value={current.name}
            isEditing={isEditing}
            onChange={(value) => updateField("name", value)}
          />

          <div className="space-y-2">
            <Label htmlFor="office-remote">Remote</Label>
            {isEditing ? (
              <label className="flex items-center gap-2 text-body text-primary">
                <Checkbox
                  id="office-remote"
                  checked={current.isRemote}
                  onCheckedChange={(c) => updateRemote(c === true)}
                />
                People here work from anywhere in the office&apos;s country
              </label>
            ) : (
              <p className="text-body text-primary">{current.isRemote ? "Yes" : "No"}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            {isEditing ? (
              <Textarea
                value={current.description}
                onChange={(event) =>
                  updateField("description", event.currentTarget.value)
                }
                className="min-h-28"
              />
            ) : (
              <p className="text-body text-primary">
                {current.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <Separator/>

      <div className="space-y-5">
        <SectionTitle icon={<Icon icon={Location01Icon} />} title="Address"/>

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Country"
            value={current.country}
            isEditing={isEditing}
            onChange={(value) => updateField("country", value)}
          />

          <Field
            label="City"
            value={current.city}
            isEditing={isEditing}
            onChange={(value) => updateField("city", value)}
          />

          <Field
            label="Street"
            value={current.street}
            isEditing={isEditing}
            onChange={(value) => updateField("street", value)}
          />

          <Field
            label="Building"
            value={current.building}
            isEditing={isEditing}
            onChange={(value) => updateField("building", value)}
          />

          <Field
            label="Post code"
            value={current.postCode}
            isEditing={isEditing}
            onChange={(value) => updateField("postCode", value)}
          />
        </div>
      </div>

      <Separator/>

      <div className="space-y-5">
        <SectionTitle icon={<Icon icon={Mail01Icon} />} title="Contact"/>

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Email"
            value={current.email}
            isEditing={isEditing}
            onChange={(value) => updateField("email", value)}
          />

          <Field
            label="Phone"
            value={current.phone}
            isEditing={isEditing}
            onChange={(value) => updateField("phone", value)}
          />
        </div>
      </div>

      <Separator/>

      <HolidayCalendarBindingSection
        kind="OFFICE"
        refId={office.id}
        placeName={office.name}
        readOnly={isArchived}
      />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assigned" className="mt-8">
          <OfficeAssignedUsersTab office={office}/>
        </TabsContent>
      </Tabs>

      <DeleteOfficeModal
        isOpen={isDeleteOpen}
        isLoading={deleteAction.isPending}
        office={office}
        impact={deleteImpact.data}
        impactLoading={deleteImpact.isLoading}
        impactError={deleteImpact.isError}
        onConfirmAction={async () => {
          try {
            await deleteAction.mutateAsync({ id: office.id });
            setIsDeleteOpen(false);
          } catch (error) {
            showError(error);
          }
        }}
        onRequestCloseAction={() => setIsDeleteOpen(false)}
      />

      <ArchiveOfficeModal
        isOpen={isArchiveOpen}
        isLoading={archiveAction.isPending}
        office={office}
        onConfirmAction={handleArchive}
        onRequestCloseAction={() => setIsArchiveOpen(false)}
      />

      <ExportDataModal
        isOpen={isExportOpen}
        title={`Export ${office.name}`}
        description="Export this office's details and its assigned users."
        includedText="Two sheets — General Information (name, description, email, phone, address, assigned people, created by, created at) and Assigned Users (first name, last name, email, position)."
        onCancelAction={() => setIsExportOpen(false)}
        onConfirmAction={handleExport}
      />
    </div>
  );
}

const SectionTitle = ({ icon, title }: SectionTitleProps) => (
  <div className="flex items-center gap-2">
    {icon}
    <h2 className="text-body font-semibold">{title}</h2>
  </div>
);

const Field = ({ label, value, isEditing, onChange }: FieldProps) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    {isEditing ? (
      <Input value={value} onChange={(event) => onChange(event.target.value)}/>
    ) : (
      <p className="text-body text-primary">{value}</p>
    )}
  </div>
);
