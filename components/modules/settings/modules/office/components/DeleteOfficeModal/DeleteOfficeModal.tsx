"use client";

import React from "react";
import styles from "./DeleteOfficeModal.module.css";
import Modal from "@/components/ui/Modal/Modal";
import { Button } from "@/components/ui/Button";
import { Office } from "@/models/office";

type DeleteOfficeModalProps = {
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onRequestClose: () => void;
  office: Office;
};

export const DeleteOfficeModal: React.FC<DeleteOfficeModalProps> = ({
  isOpen,
  isLoading = false,
  onConfirm,
  onRequestClose,
  office,
}) => {
  return (
    <Modal
      isLoading={isLoading}
      isOpen={isOpen}
      onRequestClose={() => !isLoading && onRequestClose()}
      title={`Permanently delete "${office?.name ?? ""}" office?`}
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
      <div className={styles.content}>
        <p>
          This office will be permanently removed from the system.
        </p>
        <p className={styles.danger}>
          This action cannot be undone.
        </p>
      </div>
    </Modal>
  );
};
