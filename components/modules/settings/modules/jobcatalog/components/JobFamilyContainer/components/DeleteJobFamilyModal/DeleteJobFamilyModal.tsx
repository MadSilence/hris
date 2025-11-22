import React from "react";
import styles from "./DeleteJobFamilyModal.module.css";
import Modal from "@/components/ui/Modal/Modal";
import { Button } from "@/components/ui/Button";

type JobFamily = {
  id: string;
  name: string;
  isSystem?: boolean;
};

type DeleteJobFamilyModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  onConfirm: () => void;
  onRequestClose: () => void;
  jobFamily: JobFamily;
};

export const DeleteJobFamilyModal: React.FC<DeleteJobFamilyModalProps> = ({
  isOpen,
  isLoading = false,
  onConfirm,
  onRequestClose,
  jobFamily,
}) => {
  return (
    <Modal
      isLoading={isLoading}
      isOpen={isOpen}
      onRequestClose={() => !isLoading && onRequestClose()}
      title={`Delete job family ${jobFamily?.name ? jobFamily.name : ""}?`}
      footer={
        <div className={styles.actions}>
          <Button
            variant="ghost"
            onClick={() => !isLoading && onRequestClose()}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => !isLoading && onConfirm()}
          >
            Delete
          </Button>
        </div>
      }
    >
      <ul className={styles.list}>
        <li>All jobs assigned to this job family will also be deleted.</li>
        <li>
          Any employee data or structures referencing these jobs may be lost.
        </li>
      </ul>
    </Modal>
  );
};
