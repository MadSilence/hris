import React, { useRef } from "react";
import styles from "./RenameJobFamilyModal.module.css";
import Modal from "@/components/ui/Modal/Modal";
import { Button } from "@/components/ui/Button";
import {
  RenameJobFamilyForm,
  RenameJobFamilyFormValues
} from "@/components/modules/settings/modules/jobcatalog/components/JobFamilyContainer/components/RenameJobFamilyForm/RenameJobFamilyForm";

type RenameJobFamilyModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  onConfirm: (submission: RenameJobFamilyFormValues) => void;
  onRequestClose: () => void;
};

export const RenameJobFamilyModal: React.FC<RenameJobFamilyModalProps> = ({
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
      title="Rename Job Family"
      footer={
        <div className={styles.actions}>
          <Button
            variant="ghost"
            onClick={() => !isLoading && onRequestClose()}
          >
            Cancel
          </Button>
          <Button
            onClick={() => !isLoading && formRef.current?.submitForm()}
          >
            Save
          </Button>
        </div>
      }
    >
      <RenameJobFamilyForm formRef={formRef} onSubmit={onConfirm}/>
    </Modal>
  );
};
