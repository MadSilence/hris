import React, { useRef } from "react";
import styles from "./CreateJobFamilyModal.module.css";
import Modal from "@/components/ui/Modal/Modal";
import { Button } from "@/public/desact/src/components/ui/button";
import {
  CreateJobFamilyForm,
  CreateJobFamilyFormValues,
} from "@/components/modules/settings/modules/jobcatalog/components/JobFamilyContainer/components/CreateJobFamilyForm";

type CreateJobFamilyModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  onConfirm: (submission: CreateJobFamilyFormValues) => void;
  onRequestClose: () => void;
};

export const CreateJobFamilyModal: React.FC<CreateJobFamilyModalProps> = ({
  isOpen,
  isLoading = false,
  onConfirm,
  onRequestClose,
}) => {
  // @ts-ignore
  const formRef = useRef<{ submitForm: () => Promise<void> }>();

  return (
    <Modal
      isLoading={isLoading}
      isOpen={isOpen}
      onRequestClose={() => !isLoading && onRequestClose()}
      title="Create Job Family"
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
      <CreateJobFamilyForm formRef={formRef} onSubmit={onConfirm}/>
    </Modal>
  );
};
