"use client";

import React, { useRef, useState } from "react";
import styles from "./LegalEntityDetailsModal.module.css";
import Modal from "@/components/ui/Modal/Modal";
import { Button } from "@/components/ui/Button";
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
      <Modal
        isLoading={isLoading}
        isOpen={isOpen}
        onRequestClose={() => !isLoading && onRequestClose()}
        title="Legal entity"
        footer={
          <div className={styles.actions}>
            {!isEditing ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => !isLoading && setIsDeleteOpen(true)}
                >
                  <Trash className={styles.icon}/>
                  Delete
                </Button>
                <Button
                  onClick={() => !isLoading && setIsEditing(true)}
                >
                  {/* <Pencil className={styles.icon} /> */}
                  Edit
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
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
          </div>
        }
      >
        <div className={styles.content}>
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
      </Modal>

      <DeleteLegalEntityModal
        isOpen={isDeleteOpen}
        isLoading={isDeleteLoading}
        entity={entity}
        onConfirm={() => {
          onDelete();
          setIsDeleteOpen(false);
        }}
        onRequestClose={() => setIsDeleteOpen(false)}
      />
    </>
  );
};
