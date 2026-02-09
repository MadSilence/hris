import React, { useRef } from "react";
import styles from "./CreateLegalEntityModal.module.css";
import Modal from "@/components/ui/Modal/Modal";
import { Button } from "@/components/ui/Button";
import { CreateLegalEntityForm, CreateLegalEntityFormValues } from "../CreateLegalEntityForm";

type CreateLegalEntityModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  initialValues?: Partial<CreateLegalEntityFormValues>;
  onConfirm: (submission: CreateLegalEntityFormValues) => void;
  onRequestClose: () => void;
};

export const CreateLegalEntityModal: React.FC<CreateLegalEntityModalProps> = ({
  isOpen,
  isLoading = false,
  initialValues,
  onConfirm,
  onRequestClose,
}) => {
  // @ts-ignore
  const formRef = useRef<CreateLegalEntityFormHandle>();

  return (
    <Modal
      isLoading={isLoading}
      isOpen={isOpen}
      onRequestClose={() => !isLoading && onRequestClose()}
      title="Create legal entity"
      footer={
        <div className={styles.actions}>
          <Button
            variant="ghost"
            onClick={() => !isLoading && onRequestClose()}
          >
            Cancel
          </Button>
          <Button onClick={() => !isLoading && formRef.current?.submitForm()}>
            Create
          </Button>
        </div>
      }
    >
      <div className={styles.content}>
        <CreateLegalEntityForm
          formRef={formRef}
          initialValues={initialValues}
          onSubmit={onConfirm}
        />
      </div>
    </Modal>
  );
};
