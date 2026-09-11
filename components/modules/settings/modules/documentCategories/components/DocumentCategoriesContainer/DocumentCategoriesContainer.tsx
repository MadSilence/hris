"use client";

import { FC, FormEvent, useEffect, useState } from "react";
import { FormError } from "@/components/feedback/FormError";
import { Lock, Pencil, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/public/desact/src/components/ui/badge";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Switch } from "@/public/desact/src/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/public/desact/src/components/ui/alert-dialog";
import type { DocumentCategoryDTO } from "@/api/modules/documents/dto";
import {
  useDocumentCategories,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/useDocumentCategories";
import {
  useDeleteDocumentCategory,
  useSaveDocumentCategory,
} from "@/components/modules/settings/modules/documentCategories/hooks/useDocumentCategoryMutations";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { Tags } from "lucide-react";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { ListEmptyState } from "@/components/feedback/ListEmptyState";
import { DocumentCategoriesSkeleton } from "./DocumentCategoriesSkeleton";

const messageOf = (error: unknown): string | null =>
  error instanceof Error ? error.message : null;

export const DocumentCategoriesContainer: FC = () => {
  const { data: categories, isLoading } = useDocumentCategories();
  const save = useSaveDocumentCategory();
  const remove = useDeleteDocumentCategory();

  const [editing, setEditing] = useState<DocumentCategoryDTO | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState<DocumentCategoryDTO | null>(null);

  const isFormOpen = isCreateOpen || !!editing;

  const all = categories ?? [];

  const needle = query.trim().toLowerCase();
  const rows = needle
    ? all.filter(
        (category) =>
          category.name.toLowerCase().includes(needle) ||
          (category.description ?? "").toLowerCase().includes(needle),
      )
    : all;

  return (
    <div className="space-y-4">
      <ListToolbar
        search={{ value: query, onChange: setQuery }}
        primary={
          <Button
            className="bg-brown-600 text-white hover:bg-brown-700"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4"/>
            Add Category
          </Button>
        }
      />

      {isLoading ? (
        <DocumentCategoriesSkeleton/>
      ) : rows.length === 0 ? (
        <ListEmptyState
          query={query}
          icon={<Tags className="h-7 w-7"/>}
          title="No categories yet"
          description="Until a category exists documents cannot be labelled, and the category picker stays hidden on upload."
          noResultsHint="Try a different category name."
          onCreate={() => setIsCreateOpen(true)}
          createLabel="Add Category"
        />
      ) : (
        <div className="divide-y divide-brown-100 rounded-lg border border-brown-200">
          {rows.map((category) => (
            <div key={category.id} className="flex items-center gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-foreground">
                    {category.name}
                  </span>
                  {category.isSystem && (
                    <Badge variant="secondary" className="font-normal">System</Badge>
                  )}
                  {!category.isActive && (
                    <Badge variant="outline" className="font-normal">Inactive</Badge>
                  )}
                </div>
                {category.description && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {category.description}
                  </p>
                )}
              </div>

              {category.isSystem ? (
                <span
                  className="text-brown-300"
                  title="System categories can't be edited or deleted"
                >
                  <Lock className="h-4 w-4"/>
                </span>
              ) : (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={`Edit ${category.name}`}
                    onClick={() => setEditing(category)}
                  >
                    <Pencil className="h-4 w-4"/>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    aria-label={`Delete ${category.name}`}
                    onClick={() => setToDelete(category)}
                  >
                    <Trash2 className="h-4 w-4"/>
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <CategoryFormModal
        isOpen={isFormOpen}
        category={editing}
        isLoading={save.isPending}
        errorMessage={messageOf(save.error)}
        onCancelAction={() => {
          setIsCreateOpen(false);
          setEditing(null);
          save.reset();
        }}
        onSubmitAction={async (values) => {
          try {
            await save.mutateAsync({ id: editing?.id, ...values });
            setIsCreateOpen(false);
            setEditing(null);
          } catch {
            // Shown inside the dialog through save.error.
          }
        }}
      />

      <AlertDialog
        open={!!toDelete}
        onOpenChange={(open) => {
          if (!open) {
            setToDelete(null);
            remove.reset();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{toDelete?.name}</strong> will be removed. Documents already labelled with it
              keep the file but lose the label.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {messageOf(remove.error) && (
            <FormError message={remove.error ? messageOf(remove.error) : null} />
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={remove.isPending}
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={async (e) => {
                e.preventDefault();
                if (!toDelete) return;
                try {
                  await remove.mutateAsync(toDelete.id);
                  setToDelete(null);
                } catch {
                  // Shown above.
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

type FormValues = { name: string; description: string | null; isActive: boolean };

const CategoryFormModal: FC<{
  isOpen: boolean;
  category: DocumentCategoryDTO | null;
  isLoading: boolean;
  errorMessage: string | null;
  onCancelAction: () => void;
  onSubmitAction: (values: FormValues) => void;
}> = ({ isOpen, category, isLoading, errorMessage, onCancelAction, onSubmitAction }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setName(category?.name ?? "");
    setDescription(category?.description ?? "");
    setIsActive(category?.isActive ?? true);
  }, [isOpen, category]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || !name.trim()) return;
    onSubmitAction({
      name: name.trim(),
      description: description.trim() || null,
      isActive,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onCancelAction()}>
      <DialogContent hideClose className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{category ? "Edit category" : "New category"}</DialogTitle>
          <DialogDescription>
            Categories label a person&apos;s documents — contracts, certificates, payslips.
          </DialogDescription>
        </DialogHeader>

        <FormError message={errorMessage} />

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-2">
            <RequiredLabel htmlFor="category-name" required>Name</RequiredLabel>
            <Input
              id="category-name"
              autoFocus
              value={name}
              disabled={isLoading}
              onChange={(e) => setName(e.currentTarget.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-description">Description</Label>
            <Input
              id="category-description"
              value={description}
              disabled={isLoading}
              onChange={(e) => setDescription(e.currentTarget.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-brown-200 px-3 py-2.5">
            <div>
              <Label htmlFor="category-active" className="text-sm">Active</Label>
              <p className="text-xs text-muted-foreground">
                Inactive categories stay on existing documents but are not offered on upload.
              </p>
            </div>
            <Switch
              id="category-active"
              checked={isActive}
              disabled={isLoading}
              onCheckedChange={setIsActive}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isLoading} onClick={onCancelAction}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="bg-brown-600 text-white hover:bg-brown-700"
            >
              {isLoading ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
