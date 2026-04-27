import React from "react";
import styles from "./DeleteGroupModal.module.css";
import Modal from "@/components/ui/Modal/Modal";
import { Button } from "@/public/desact/src/components/ui/button";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";

type DeleteGroupModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  onConfirm: () => void;
  onRequestClose: () => void;
  group: AttributeGroup;
};

export const DeleteGroupModal: React.FC<DeleteGroupModalProps> = ({
  isOpen,
  isLoading = false,
  onConfirm,
  onRequestClose,
  group,
}) => {
  return (
    <Modal
      isLoading={isLoading}
      isOpen={isOpen}
      onRequestClose={() => !isLoading && onRequestClose()}
      title={`Delete section ${group?.name ? group?.name : ""}?`}
      footer={
        <div className={styles.actions}>
          <Button variant="ghost" onClick={() => !isLoading && onRequestClose()}>
            Cancel
          </Button>

          <Button onClick={() => !isLoading && onConfirm()}>
            Delete
          </Button>
        </div>
      }
    >
      <ul className={styles.list}>
        <li>All attributes assigned to this section will also be deleted</li>
        <li>All employee data you entered for these attributes will be lost</li>
      </ul>
    </Modal>
  );
};
