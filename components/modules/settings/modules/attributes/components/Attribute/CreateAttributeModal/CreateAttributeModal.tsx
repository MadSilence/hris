"use client";

import React, { useRef } from "react";
import styles from "./CreateAttributeModal.module.css";
import Modal from "@/components/ui/Modal/Modal";
import { Button } from "@/components/ui/Button";
import { CreateAttributeFormValues } from "../CreateAttributeForm";
import { CreateAttributeForm }
  from "@/components/modules/settings/modules/attributes/components/Attribute/CreateAttributeForm";

type CreateAttributeModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  onConfirm: (submission: CreateAttributeFormValues) => void;
  onRequestClose: () => void;
};

export const CreateAttributeModal: React.FC<CreateAttributeModalProps> = ({
  isOpen,
  isLoading = false,
  onConfirm,
  onRequestClose,
}) => {
  // @ts-ignore
  const formRef = useRef<{ submitForm: () => Promise<void> }>();

  // @ts-ignore
  return (
    <Modal
      isLoading={isLoading}
      isOpen={isOpen}
      onRequestClose={() => !isLoading && onRequestClose()}
      title="Create Attribute"
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
        <CreateAttributeForm
          formRef={formRef}
          onSubmit={(values: CreateAttributeFormValues) => onConfirm(values)}
        />
      </div>
    </Modal>
  );
};
