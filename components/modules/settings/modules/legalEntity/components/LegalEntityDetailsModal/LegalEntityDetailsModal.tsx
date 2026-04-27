"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/public/desact/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { LegalEntityDetailsView } from "@/components/modules/settings/modules/legalEntity/components/LegalEntityDetailsView";
import { LegalEntity } from "@/models/legalEntity";
import { DeleteLegalEntityModal } from "@/components/modules/settings/modules/legalEntity/components/DeleteLegalEntityModal";
// import Pencil from "@/public/icons/pencil.svg";
import Trash from "@/public/icons/trash.svg";
import {
  UpdateLegalEntityForm,
  UpdateLegalEntityFormHandle,
  UpdateLegalEntityFormValues
} from "@/components/modules/settings/modules/legalEntity/components/UpdateLegalEntityForm";

type LegalEntityDetailsModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  isDeleteLoading?: boolean;
  entity: LegalEntity;
  onRequestClose: () => void;
  onDelete: () => void;
  onSave: (values: UpdateLegalEntityFormValues) => void;
};

const mapEntityToUpdateFormValues = (
  entity: LegalEntity
): UpdateLegalEntityFormValues => ({
  name: entity.name,
  description: (entity as any).description ?? "",
  registrationNumber: entity.registrationNumber ?? "",
  taxId: entity.taxId ?? "",
  country: entity.country,
  city: entity.city,
  street: entity.street,
  building: entity.building,
  postCode: entity.postCode,
});

export const LegalEntityDetailsModal: React.FC<LegalEntityDetailsModalProps> = ({
  isOpen,
  isLoading,
  isDeleteLoading = false,
  entity,
  onRequestClose,
  onDelete,
  onSave
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const formRef = useRef<UpdateLegalEntityFormHandle | undefined>(undefined);

  const handleSaveClick = () => {
    if (!formRef.current || isLoading) return;
    void formRef.current.submitForm();
  };

  const handleAfterSubmit = (values: UpdateLegalEntityFormValues) => {
    onSave(values);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    if (isLoading) return;
    formRef.current?.reset();
    setIsEditing(false);
  };

  const isSaveDisabled =
    !isEditing || isLoading || !formRef.current?.isDirty?.();

  const updateInitialValues = mapEntityToUpdateFormValues(entity);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onRequestClose()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Legal entity</DialogTitle>
            <DialogDescription/>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto pr-1">
            {isEditing ? (
              <UpdateLegalEntityForm
                formRef={formRef}
                initialValues={updateInitialValues}
                onSubmit={handleAfterSubmit}
              />
            ) : (
              <LegalEntityDetailsView legalEntity={entity}/>
            )}
          </div>

          <DialogFooter>
            {!isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => !isLoading && setIsDeleteOpen(true)}
                >
                  <Trash className="w-4 h-4 mr-2"/>
                  Delete
                </Button>
                <Button onClick={() => !isLoading && setIsEditing(true)}>
                  Edit
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveClick} disabled={isSaveDisabled}>
                  Save
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteLegalEntityModal
        isOpen={isDeleteOpen}
        isLoading={isDeleteLoading}
        entity={entity}
        onConfirmAction={() => {
          onDelete();
          setIsDeleteOpen(false);
        }}
        onRequestCloseAction={() => setIsDeleteOpen(false)}
      />
    </>
  );
};
