"use client";

import React from "react";
import styles from "./DeleteLegalEntityModal.module.css";
import Modal from "@/components/ui/Modal/Modal";
import { Button } from "@/components/ui/Button";
import { LegalEntity } from "@/models/legalEntity";

type DeleteLegalEntityModalProps = {
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onRequestClose: () => void;
  entity: LegalEntity;
};

export const DeleteLegalEntityModal: React.FC<DeleteLegalEntityModalProps> = ({
  isOpen,
  isLoading = false,
  onConfirm,
  onRequestClose,
  entity,
}) => {
  return (
    <Modal
      isLoading={isLoading}
      isOpen={isOpen}
      onRequestClose={() => !isLoading && onRequestClose()}
      title={`Permanently delete "${entity?.name ?? ""}" legal entity?`}
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
          This legal entity will be permanently removed from the system.
        </p>
        <p className={styles.danger}>
          This action cannot be undone.
        </p>
      </div>
    </Modal>
  );
};
