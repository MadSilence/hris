import React, { useRef } from "react";
import styles from "./RenameAttributeGroupModal.module.css"
import Modal from "@/components/ui/Modal/Modal";
import { Button } from "@/components/ui/Button";
import {
  RenameAttributeGroupForm,
  RenameAttributeGroupFormValues
} from "@/components/modules/settings/modules/attributes/components/AttributeGroup/RenameAttributeGroupForm";

type RenameAttributeGroupModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  onConfirm: (submission: RenameAttributeGroupFormValues) => void;
  onRequestClose: () => void;
}

export const RenameAttributeGroupModal: React.FC<RenameAttributeGroupModalProps> = ({
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
      onRequestClose={() => !isLoading && onRequestClose}
      title="Rename AttributeGroup"
      footer={
        <div className={styles.actions}>
          <Button variant="ghost" onClick={() => !isLoading && onRequestClose()}>Cancel</Button>
          <Button onClick={() => !isLoading && formRef.current?.submitForm()}>Create</Button>
        </div>
      }
    >
      <RenameAttributeGroupForm
        formRef={formRef}
        onSubmit={onConfirm}
      />
    </Modal>
  )
}
