"use client";

import React, { useRef, useState } from "react";
import styles from "./OfficeDetailsModal.module.css";
import Modal from "@/components/ui/Modal/Modal";
import { Button } from "@/components/ui/Button";
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
      <Modal
        isLoading={isLoading}
        isOpen={isOpen}
        onRequestClose={() => !isLoading && onRequestClose()}
        title="Office"
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
            <UpdateOfficeForm
              formRef={formRef}
              initialValues={updateInitialValues}
              onSubmit={handleAfterSubmit}
            />
          ) : (
            <OfficeDetailsView office={office}/>
          )}
        </div>
      </Modal>

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
