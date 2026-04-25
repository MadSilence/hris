import * as React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { CheckCircle, Copy, Pencil } from "lucide-react";
import RenameRoleForm from "../forms/RenameRoleForm";

type Mode = "rename" | "duplicate";

export interface UpsertRoleNameModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  mode: Mode;
  initialName: string;
  onConfirm: (values: { name: string }) => void;
  onRequestClose: () => void;
}

const copyByMode: Record<
  Mode,
  { title: string; description: string; submit: string; Icon: React.ElementType }
> = {
  rename: {
    title: "Rename Role",
    description: "Update the role name to keep your access model organized.",
    submit: "Save changes",
    Icon: Pencil,
  },
  duplicate: {
    title: "Duplicate Role",
    description: "Create a new role based on this one. You can edit permissions later.",
    submit: "Create duplicate",
    Icon: Copy,
  },
};

export default function UpsertRoleNameModal({
  isOpen,
  isLoading = false,
  mode,
  initialName,
  onConfirm,
  onRequestClose,
}: UpsertRoleNameModalProps) {
  const { title, description, submit, Icon } = copyByMode[mode];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onRequestClose()}>
      <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto p-8" hideClose onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-brown-600"/>
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <RenameRoleForm
          initialName={initialName}
          isLoading={isLoading}
          submitText={submit}
          onSubmit={onConfirm}
          onCancel={onRequestClose}
          autoFocus={isOpen}
        />

        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>

          <Button disabled={isLoading} className="bg-brown-600 text-white hover:bg-brown-700">
            <CheckCircle className="w-4 h-4 mr-2"/>
            {submit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
