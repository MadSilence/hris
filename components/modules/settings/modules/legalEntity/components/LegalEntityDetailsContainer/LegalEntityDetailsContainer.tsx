"use client";

import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Building2, Download, MapPin, Users } from "lucide-react";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { Button } from "@/public/desact/src/components/ui/button";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Textarea } from "@/public/desact/src/components/ui/textarea";
import { Separator } from "@/public/desact/src/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/public/desact/src/components/ui/tabs";
import LegalEntityAssignedUsersTab from "@/components/modules/settings/modules/legalEntity/components/LegalEntityAssignedUsersTab/LegalEntityAssignedUsersTab";
import { useLegalEntity } from "@/components/modules/settings/modules/legalEntity/hooks/useLegalEntity";
import { useUpdateLegalEntityAction } from "@/components/modules/settings/modules/legalEntity/hooks/useUpdateLegalEntityAction";
import { useDeleteLegalEntityAction } from "@/components/modules/settings/modules/legalEntity/hooks/useDeleteLegalEntityAction";
import {
  useArchiveLegalEntityAction,
  useRestoreLegalEntityAction,
} from "@/components/modules/settings/modules/legalEntity/hooks/useArchiveLegalEntityAction";
import type { AssignedUsersStrategy } from "@/components/modules/settings/modules/legalEntity/actions/archiveLegalEntityAction";
import { DeleteLegalEntityModal } from "@/components/modules/settings/modules/legalEntity/components/modals/DeleteLegalEntityModal";
import { ArchiveLegalEntityModal } from "@/components/modules/settings/modules/legalEntity/components/modals/ArchiveLegalEntityModal";
import { ActionStatus } from "@/components/models/ActionStatus";
import { PermissionGate } from "@/components/auth/PermissionGate";
import type { LegalEntity } from "@/models/legalEntity";
import {
  LegalEntitySkeleton
} from "@/components/modules/settings/modules/legalEntity/components/LegalEntityDetailsContainer/LegalEntitySkeleton";
import {
  ExportDataModal,
  ExportDataFormValues,
  triggerExportDownload,
} from "@/components/modules/settings/shared/ExportDataModal";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { ForbiddenError } from "@/components/clients/exceptions";

const SCROLL_OFFSET = "calc(100svh - 390px)";

type Props = {
  legalEntityId: string;
};

type FormValues = {
  name: string;
  description: string;
  registrationNumber: string;
  taxId: string;
  country: string;
  city: string;
  street: string;
  building: string;
  postCode: string;
};

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

const mapEntity = (entity: LegalEntity): FormValues => ({
  name: entity.name ?? "",
  description: entity.description ?? "",
  registrationNumber: entity.registrationNumber ?? "",
  taxId: entity.taxId ?? "",
  country: entity.country ?? "",
  city: entity.city ?? "",
  street: entity.street ?? "",
  building: entity.building ?? "",
  postCode: entity.postCode ?? "",
});

export default function LegalEntityDetailsContainer({
  legalEntityId,
}: Props) {
  const router = useRouter();

  const { data, isLoading, error } = useLegalEntity();
  const updateAction = useUpdateLegalEntityAction();
  const deleteAction = useDeleteLegalEntityAction();
  const archiveAction = useArchiveLegalEntityAction();
  const restoreAction = useRestoreLegalEntityAction();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [values, setValues] = useState<FormValues | null>(null);

  const entity = useMemo(
    () => (data ?? []).find((item) => item.id === legalEntityId),
    [data, legalEntityId],
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

    router.push("/settings/general/legal-entities");
  }, [deleteAction.data?.status, router]);
  if (error instanceof ForbiddenError) return <AccessDenied/>;
  if (error) throw error;

  if (isLoading) {
    return (
      <div className="px-8">
        <LegalEntitySkeleton/>
      </div>
    );
  }

  if (!entity) {
    return <div className="px-8 py-6 text-sm text-muted-foreground">Not found</div>;
  }

  const current = values ?? mapEntity(entity);
  const isArchived = entity.archived;

  const handleArchive = (strategy: AssignedUsersStrategy) => {
    archiveAction.mutate({ id: entity.id, assignedUsersStrategy: strategy });
  };

  const handleRestore = () => {
    restoreAction.mutate(entity.id);
  };

  const updateField = (key: keyof FormValues, value: string) => {
    setValues((prev) => ({
      ...(prev ?? mapEntity(entity)),
      [key]: value,
    }));
  };

  const handleSave = () => {
    updateAction.mutate({
      id: entity.id,
      isSystem: entity.isSystem,
      ...current,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValues(null);
  };

  const handleExport = async ({ format }: ExportDataFormValues) => {
    try {
      await triggerExportDownload(`/api/legal-entities/${entity.id}/export`, format);
      setIsExportOpen(false);
    } catch (error) {
      console.error("Failed to export legal entity:", error);
    }
  };

  return (
    <div className="space-y-6 px-8">
      <SettingsPageHeader
        title={entity.name}
        backHref="/settings/general/legal-entities"
      />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-brown-50">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Building2 className="w-4 h-4"/>
            General Information
          </TabsTrigger>
          <TabsTrigger value="assigned" className="flex items-center gap-2">
            <Users className="w-4 h-4"/>
            Assigned Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-8">
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">General Information</h2>
                  {isArchived && (
                    <Badge variant="secondary" className="gap-1 font-normal">
                      <Archive className="h-3 w-3"/>
                      Archived
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Registration, tax, and address details for this legal entity.
                </p>
              </div>

              <div className="flex flex-none items-center gap-3">
                {isEditing ? (
                  <>
                    <PermissionGate resource="ORG.LEGAL_ENTITY" action="EDIT">
                      <Button
                        variant="outline"
                        onClick={() => setIsArchiveOpen(true)}
                        disabled={updateAction.isPending || archiveAction.isPending}
                      >
                        Archive
                      </Button>
                    </PermissionGate>
                    <PermissionGate resource="ORG.LEGAL_ENTITY" action="MANAGE">
                      <Button
                        variant="outline"
                        onClick={() => setIsDeleteOpen(true)}
                        disabled={deleteAction.isPending}
                      >
                        Delete
                      </Button>
                    </PermissionGate>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={updateAction.isPending}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={updateAction.isPending}>
                      Save changes
                    </Button>
                  </>
                ) : isArchived ? (
                  <>
                    <PermissionGate resource="ORG.LEGAL_ENTITY" action="EDIT">
                      <Button onClick={handleRestore} disabled={restoreAction.isPending}>
                        Restore
                      </Button>
                    </PermissionGate>
                    <PermissionGate resource="ORG.LEGAL_ENTITY" action="MANAGE">
                      <Button
                        variant="outline"
                        onClick={() => setIsDeleteOpen(true)}
                        disabled={deleteAction.isPending}
                      >
                        Delete
                      </Button>
                    </PermissionGate>
                    <PermissionGate resource="ORG.LEGAL_ENTITY" action="EDIT">
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Export legal entity"
                        onClick={() => setIsExportOpen(true)}
                      >
                        <Download className="h-4 w-4"/>
                      </Button>
                    </PermissionGate>
                  </>
                ) : (
                  <>
                    <PermissionGate resource="ORG.LEGAL_ENTITY" action="EDIT">
                      <Button onClick={() => setIsEditing(true)}>Edit</Button>
                    </PermissionGate>
                    <PermissionGate resource="ORG.LEGAL_ENTITY" action="EDIT">
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Export legal entity"
                        onClick={() => setIsExportOpen(true)}
                      >
                        <Download className="h-4 w-4"/>
                      </Button>
                    </PermissionGate>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-8 overflow-y-auto px-1" style={{ maxHeight: SCROLL_OFFSET }}>
              <div className="space-y-5">
        <SectionTitle icon={<Building2 className="h-5 w-5"/>} title="General"/>

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Name"
            value={current.name}
            isEditing={isEditing}
            onChange={(value) => updateField("name", value)}
          />

          <Field
            label="Registration number"
            value={current.registrationNumber}
            isEditing={isEditing}
            onChange={(value) => updateField("registrationNumber", value)}
          />

          <Field
            label="Tax ID"
            value={current.taxId}
            isEditing={isEditing}
            onChange={(value) => updateField("taxId", value)}
          />

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
              <p className="text-sm text-foreground">
                {current.description || "—"}
              </p>
            )}
          </div>
        </div>
      </div>

      <Separator/>

      <div className="space-y-5">
        <SectionTitle icon={<MapPin className="h-5 w-5"/>} title="Address"/>

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
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assigned" className="mt-8">
          <LegalEntityAssignedUsersTab entity={entity}/>
        </TabsContent>
      </Tabs>

      <DeleteLegalEntityModal
        isOpen={isDeleteOpen}
        isLoading={deleteAction.isPending}
        entity={entity}
        onConfirmAction={() => deleteAction.mutate({ id: entity.id })}
        onRequestCloseAction={() => setIsDeleteOpen(false)}
      />

      <ArchiveLegalEntityModal
        isOpen={isArchiveOpen}
        isLoading={archiveAction.isPending}
        entity={entity}
        onConfirmAction={handleArchive}
        onRequestCloseAction={() => setIsArchiveOpen(false)}
      />

      <ExportDataModal
        isOpen={isExportOpen}
        title={`Export ${entity.name}`}
        description="Export this legal entity's details and its assigned users."
        includedText="Two sheets — General Information (name, description, registration number, tax ID, address, assigned people, created by, created at) and Assigned Users (first name, last name, email, position)."
        onCancelAction={() => setIsExportOpen(false)}
        onConfirmAction={handleExport}
      />
    </div>
  );
}

const SectionTitle = ({ icon, title }: SectionTitleProps) => (
  <div className="flex items-center gap-2">
    {icon}
    <h2 className="text-base font-semibold">{title}</h2>
  </div>
);

const Field = ({ label, value, isEditing, onChange }: FieldProps) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    {isEditing ? (
      <Input value={value} onChange={(event) => onChange(event.target.value)}/>
    ) : (
      <p className="text-sm text-foreground">{value || "—"}</p>
    )}
  </div>
);
