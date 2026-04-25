import React, { useRef } from "react";
import { Button } from "@/public/desact/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onRequestClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create legal entity</DialogTitle>
          <DialogDescription/>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-1">
          <CreateLegalEntityForm
            formRef={formRef}
            initialValues={initialValues}
            onSubmit={onConfirm}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => !isLoading && onRequestClose()}
          >
            Cancel
          </Button>
          <Button onClick={() => !isLoading && formRef.current?.submitForm()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
