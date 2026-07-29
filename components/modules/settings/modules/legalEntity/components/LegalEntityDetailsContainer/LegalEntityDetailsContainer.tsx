"use client";

import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, MapPin, Users } from "lucide-react";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Textarea } from "@/public/desact/src/components/ui/textarea";
import { Separator } from "@/public/desact/src/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/public/desact/src/components/ui/tabs";
import LegalEntityAssignedUsersTab from "@/components/modules/settings/modules/legalEntity/components/LegalEntityAssignedUsersTab/LegalEntityAssignedUsersTab";
import { useLegalEntity } from "@/components/modules/settings/modules/legalEntity/hooks/useLegalEntity";
import { useUpdateLegalEntityAction } from "@/components/modules/settings/modules/legalEntity/hooks/useUpdateLegalEntityAction";
import { useDeleteLegalEntityAction } from "@/components/modules/settings/modules/legalEntity/hooks/useDeleteLegalEntityAction";
import { DeleteLegalEntityModal } from "@/components/modules/settings/modules/legalEntity/components/modals/DeleteLegalEntityModal";
import { ActionStatus } from "@/components/models/ActionStatus";
import type { LegalEntity } from "@/models/legalEntity";
import {
  LegalEntitySkeleton
} from "@/components/modules/settings/modules/legalEntity/components/LegalEntityDetailsContainer/LegalEntitySkeleton";

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

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
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
    if (deleteAction.data?.status !== ActionStatus.SUCCESS) return;

    router.push("/settings/general/legal-entities");
  }, [deleteAction.data?.status, router]);

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

        <TabsContent value="general" className="mt-8 space-y-8">
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

      <div className="flex justify-end gap-3 pt-4">
        {isEditing ? (
          <>
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
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(true)}
              disabled={deleteAction.isPending}
            >
              Delete
            </Button>
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
          </>
        )}
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
