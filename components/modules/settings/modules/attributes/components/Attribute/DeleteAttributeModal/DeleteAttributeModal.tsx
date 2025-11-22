import React from "react";
import styles from "./DeleteAttributeModal.module.css";
import Modal from "@/components/ui/Modal/Modal";
import { Button } from "@/components/ui/Button";
import { Attribute } from "@/models/attribute/Attribute";
import { AttributeType } from "@/models/attribute";

type DeleteAttributeModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  onConfirm: () => void;
  onRequestClose: () => void;
  attribute: Attribute;
};

export const DeleteAttributeModal: React.FC<DeleteAttributeModalProps> = ({
  isOpen,
  isLoading = false,
  onConfirm,
  onRequestClose,
  attribute,
}) => {
  return (
    <Modal
      isLoading={isLoading}
      isOpen={isOpen}
      onRequestClose={() => !isLoading && onRequestClose()}
      title={`Permanently delete ${attribute?.name ?? ""} attribute?`}
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
        {(attribute?.type === AttributeType.MULTI_SELECT || attribute?.type === AttributeType.SELECT || attribute?.type === AttributeType.STATUS) &&
          <li>All options associated with this attribute will also be deleted</li>
        }
        <li>This action cannot be undone.</li>
      </ul>
    </Modal>
  );
};
