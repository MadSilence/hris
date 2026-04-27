import React, { useRef } from "react";
import styles from "./CreateGroupModal.module.css";
import Modal from "@/components/ui/Modal/Modal";
import { Button } from "@/public/desact/src/components/ui/button";
import {
  CreateGroupForm,
  CreateGroupFormValues,
} from "@/components/modules/settings/modules/attributes/components/AttributeGroup/CreateGroupForm";

type CreateGroupModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  onConfirm: (submission: CreateGroupFormValues) => void;
  onRequestClose: () => void;
};

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
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
      title="Create AttributeGroup"
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
      <CreateGroupForm formRef={formRef} onSubmit={onConfirm}/>
    </Modal>
  );
};
