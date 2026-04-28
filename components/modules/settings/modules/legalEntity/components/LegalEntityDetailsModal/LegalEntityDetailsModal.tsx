"use client";

import { FC, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { LegalEntityDetailsView } from "@/components/modules/settings/modules/legalEntity/components/LegalEntityDetailsView";
import { DeleteLegalEntityModal } from "@/components/modules/settings/modules/legalEntity/components/DeleteLegalEntityModal";
import { LegalEntity } from "@/models/legalEntity";
import Trash from "@/public/icons/trash.svg";
import {
  LegalEntityDetailsForm,
  LegalEntityDetailsFormValues
} from "@/components/modules/settings/modules/legalEntity/components/LegalEntityDetailsForm";

type LegalEntityDetailsModalProps = {
  isOpen: boolean;
  isLoading?: boolean;
  isDeleteLoading?: boolean;
  entity: LegalEntity;
  onCancelAction: () => void;
  onDeleteAction: () => void;
  onSaveAction: (values: LegalEntityDetailsFormValues) => void;
};

const mapEntityToFormValues = (
  entity: LegalEntity,
): LegalEntityDetailsFormValues => ({
  name: entity.name,
  description: (entity as any).description ?? "",
  registrationNumber: entity.registrationNumber ?? "",
  taxId: entity.taxId ?? "",
  country: entity.country,
  city: entity.city,
  street: entity.street ?? "",
  building: entity.building ?? "",
  postCode: entity.postCode ?? "",
});

export const LegalEntityDetailsModal: FC<LegalEntityDetailsModalProps> = ({
  isOpen,
  isLoading = false,
  isDeleteLoading = false,
  entity,
  onCancelAction,
  onDeleteAction,
  onSaveAction,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const requestClose = () => {
    if (isLoading) return;

    setIsEditing(false);
    onCancelAction();
  };

  const handleSave = (values: LegalEntityDetailsFormValues) => {
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
            <DialogTitle>Legal entity</DialogTitle>
            <DialogDescription>
              View and manage legal entity details.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto pr-1">
            {isEditing ? (
              <LegalEntityDetailsForm
                isLoading={isLoading}
                initialValues={mapEntityToFormValues(entity)}
                onCancelAction={() => {
                  if (isLoading) return;
                  setIsEditing(false);
                }}
                onDirtyChangeAction={setIsDirty}
                onSubmitAction={handleSave}
              />
            ) : (
              <LegalEntityDetailsView legalEntity={entity}/>
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

      <DeleteLegalEntityModal
        isOpen={isDeleteOpen}
        isLoading={isDeleteLoading}
        entity={entity}
        onConfirmAction={() => {
          onDeleteAction();
          setIsDeleteOpen(false);
        }}
        onRequestCloseAction={() => setIsDeleteOpen(false)}
      />
    </>
  );
};
