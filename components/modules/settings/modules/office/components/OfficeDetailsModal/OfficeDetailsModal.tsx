"use client";

import { FC, useState } from "react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/public/desact/src/components/ui/dialog";
import { OfficeDetailsView } from "@/components/modules/settings/modules/office/components/OfficeDetailsView";
import { DeleteOfficeModal } from "@/components/modules/settings/modules/office/components/DeleteOfficeModal";
import { Office } from "@/models/office";
import Trash from "@/public/icons/trash.svg";
import { OfficeDetailsForm, OfficeDetailsFormValues } from "@/components/modules/settings/modules/office/components/OfficeDetailsForm";

type OfficeDetailsModalProps = {
  isOpen: boolean;
  isLoading?: boolean;
  isDeleteLoading?: boolean;
  office: Office;
  onCancelAction: () => void;
  onDeleteAction: () => void;
  onSaveAction: (values: OfficeDetailsFormValues) => void;
};

const mapOfficeToFormValues = (office: Office): OfficeDetailsFormValues => ({
  name: office.name,
  description: office.description ?? "",
  email: office.email ?? "",
  phone: office.phone ?? "",
  country: office.country,
  city: office.city,
  street: office.street ?? "",
  building: office.building ?? "",
  postCode: office.postCode ?? "",
});

export const OfficeDetailsModal: FC<OfficeDetailsModalProps> = ({
  isOpen,
  isLoading = false,
  isDeleteLoading = false,
  office,
  onCancelAction,
  onDeleteAction,
  onSaveAction,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const requestClose = () => {
    if (isLoading) return;

    setIsEditing(false);
    onCancelAction();
  };

  const handleSave = (values: OfficeDetailsFormValues) => {
    onSaveAction(values);
    setIsEditing(false);
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) requestClose();
        }}
      >
        <DialogContent className="max-w-2xl" hideClose>
          <DialogHeader>
            <DialogTitle>Office</DialogTitle>
            <DialogDescription>View and manage office details.</DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto pr-1">
            {isEditing ? (
              <OfficeDetailsForm
                isLoading={isLoading}
                initialValues={mapOfficeToFormValues(office)}
                onCancelAction={() => {
                  if (isLoading) return;
                  setIsEditing(false);
                }}
                onSubmitAction={handleSave}
              />
            ) : (
              <OfficeDetailsView office={office}/>
            )}
          </div>

          {!isEditing && (
            <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                disabled={isLoading}
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash className="mr-2 h-4 w-4"/>
                Delete
              </Button>

              <Button disabled={isLoading} onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteOfficeModal
        isOpen={isDeleteOpen}
        isLoading={isDeleteLoading}
        office={office}
        onConfirm={() => {
          onDeleteAction();
          setIsDeleteOpen(false);
        }}
        onRequestClose={() => setIsDeleteOpen(false)}
      />
    </>
  );
};
