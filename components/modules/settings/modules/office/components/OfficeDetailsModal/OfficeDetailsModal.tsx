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
import { OfficeDetailsView } from "@/components/modules/settings/modules/office/components/OfficeDetailsView";
import { Office } from "@/models/office";
import { DeleteOfficeModal } from "@/components/modules/settings/modules/office/components/DeleteOfficeModal";
// import Pencil from "@/public/icons/pencil.svg";
import Trash from "@/public/icons/trash.svg";
import {
  UpdateOfficeForm,
  UpdateOfficeFormHandle,
  UpdateOfficeFormValues,
} from "@/components/modules/settings/modules/office/components/UpdateOfficeForm";

type OfficeDetailsModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  isDeleteLoading?: boolean;
  office: Office;
  onRequestClose: () => void;
  onDelete: () => void;
  onSave: (values: UpdateOfficeFormValues) => void;
};

const mapOfficeToUpdateFormValues = (
  office: Office,
): UpdateOfficeFormValues => ({
  name: office.name,
  description: office.description ?? "",
  email: office.email ?? "",
  phone: office.phone ?? "",
  country: office.country,
  city: office.city,
  street: office.street,
  building: office.building,
  postCode: office.postCode,
});

export const OfficeDetailsModal: React.FC<OfficeDetailsModalProps> = ({
  isOpen,
  isLoading,
  isDeleteLoading = false,
  office,
  onRequestClose,
  onDelete,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const formRef = useRef<UpdateOfficeFormHandle | undefined>(undefined);

  const handleSaveClick = () => {
    if (!formRef.current || isLoading) return;
    void formRef.current.submitForm();
  };

  const handleAfterSubmit = (values: UpdateOfficeFormValues) => {
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

  const updateInitialValues = mapOfficeToUpdateFormValues(office);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onRequestClose()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Office</DialogTitle>
            <DialogDescription/>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto pr-1">
            {isEditing ? (
              <UpdateOfficeForm
                formRef={formRef}
                initialValues={updateInitialValues}
                onSubmit={handleAfterSubmit}
              />
            ) : (
              <OfficeDetailsView office={office}/>
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

      <DeleteOfficeModal
        isOpen={isDeleteOpen}
        isLoading={isDeleteLoading}
        office={office}
        onConfirm={() => {
          onDelete();
          setIsDeleteOpen(false);
        }}
        onRequestClose={() => setIsDeleteOpen(false)}
      />
    </>
  );
};
