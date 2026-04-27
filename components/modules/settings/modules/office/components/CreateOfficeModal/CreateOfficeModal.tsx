"use client";

import React, { useRef } from "react";
import styles from "./CreateOfficeModal.module.css";
import Modal from "@/components/ui/Modal/Modal";
import { Button } from "@/public/desact/src/components/ui/button";
import {
  CreateOfficeForm,
  CreateOfficeFormHandle,
  CreateOfficeFormValues,
} from "@/components/modules/settings/modules/office/components/CreateOfficeForm";

type CreateOfficeModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  initialValues?: Partial<CreateOfficeFormValues>;
  onConfirm: (submission: CreateOfficeFormValues) => void;
  onRequestClose: () => void;
};

export const CreateOfficeModal: React.FC<CreateOfficeModalProps> = ({
  isOpen,
  isLoading = false,
  initialValues,
  onConfirm,
  onRequestClose,
}) => {
  const formRef = useRef<CreateOfficeFormHandle | undefined>(undefined);

  return (
    <Modal
      isLoading={isLoading}
      isOpen={isOpen}
      onRequestClose={() => !isLoading && onRequestClose()}
      title="Create office"
      footer={
        <div className={styles.actions}>
          <Button variant="ghost" onClick={() => !isLoading && onRequestClose()}>
            Cancel
          </Button>

          <Button onClick={() => !isLoading && formRef.current?.submitForm()}>
            Create
          </Button>
        </div>
      }
    >
      <div className={styles.content}>
        <CreateOfficeForm
          formRef={formRef}
          initialValues={initialValues}
          onSubmit={onConfirm}
        />
      </div>
    </Modal>
  );
};
