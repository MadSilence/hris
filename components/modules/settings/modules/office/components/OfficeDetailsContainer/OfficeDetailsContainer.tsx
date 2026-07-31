"use client";

import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Mail, MapPin, Users } from "lucide-react";

import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Textarea } from "@/public/desact/src/components/ui/textarea";
import { Separator } from "@/public/desact/src/components/ui/separator";

import { useOffice } from "@/components/modules/settings/modules/office/hooks/useOffice";
import { useUpdateOfficeAction } from "@/components/modules/settings/modules/office/hooks/useUpdateOfficeAction";
import { useDeleteOfficeAction } from "@/components/modules/settings/modules/office/hooks/useDeleteOfficeAction";
import { DeleteOfficeModal } from "@/components/modules/settings/modules/office/components/modals/DeleteOfficeModal";
import { OfficeSkeleton } from "@/components/modules/settings/modules/office/components/OfficeDetailsContainer/OfficeSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/public/desact/src/components/ui/tabs";
import OfficeAssignedUsersTab from "@/components/modules/settings/modules/office/components/OfficeAssignedUsersTab/OfficeAssignedUsersTab";

import { ActionStatus } from "@/components/models/ActionStatus";
import type { Office } from "@/models/office";

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
});

export default function OfficeDetailsContainer({ officeId }: Props) {
  const router = useRouter();

  const { data, isLoading, error } = useOffice();
  const updateAction = useUpdateOfficeAction();
  const deleteAction = useDeleteOfficeAction();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [values, setValues] = useState<FormValues | null>(null);

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
    if (deleteAction.data?.status !== ActionStatus.SUCCESS) return;

    router.push("/settings/legal-entities-and-offices/offices");
  }, [deleteAction.data?.status, router]);

  if (error) throw error;

  if (isLoading) {
    return <OfficeSkeleton/>;
  }

  if (!office) {
    return (
      <div className="px-8 py-6 text-sm text-muted-foreground">
        Office not found
      </div>
    );
  }

  const current = values ?? mapOffice(office);

  const updateField = (key: keyof FormValues, value: string) => {
    setValues((prev) => ({
      ...(prev ?? mapOffice(office)),
      [key]: value,
    }));
  };

  const handleSave = () => {
    updateAction.mutate({
      id: office.id,
      isSystem: office.isSystem,
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
        title={office.name}
        backHref="/settings/general/offices"
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
                <h2 className="text-lg font-semibold text-foreground">General Information</h2>
                <p className="text-sm text-muted-foreground">
                  Contact and address details for this office.
                </p>
              </div>

              <div className="flex flex-none items-center gap-3">
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
            </div>

            <div className="space-y-8 overflow-y-auto pr-1" style={{ maxHeight: SCROLL_OFFSET }}>
              <div className="space-y-5">
        <SectionTitle icon={<Building2 className="h-5 w-5"/>} title="General"/>

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Name"
            value={current.name}
            isEditing={isEditing}
            onChange={(value) => updateField("name", value)}
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

      <Separator/>

      <div className="space-y-5">
        <SectionTitle icon={<Mail className="h-5 w-5"/>} title="Contact"/>

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
        onConfirmAction={() => deleteAction.mutate({ id: office.id })}
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
