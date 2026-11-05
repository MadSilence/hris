"use client";

import { FC, FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FormError } from "@/components/feedback/FormError";
import { Add01Icon, Delete02Icon, PencilEdit02Icon, SquareLock02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Badge } from "@/components/desact/badge";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { Switch } from "@/components/desact/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/desact/alert-dialog";
import type { DocumentCategoryDTO } from "@/api/modules/documents/dto";
import {
  useDocumentCategories,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/useDocumentCategories";
import {
  useDeleteDocumentCategory,
  useSaveDocumentCategory,
} from "@/components/modules/settings/modules/documentCategories/hooks/useDocumentCategoryMutations";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { ListEmptyState } from "@/components/feedback/ListEmptyState";
import { DocumentCategoriesSkeleton } from "./DocumentCategoriesSkeleton";

const messageOf = (error: unknown): string | null =>
  error instanceof Error ? error.message : null;

export const DocumentCategoriesContainer: FC = () => {
  const t = useTranslations("settings.documentCategories");
  const tCommon = useTranslations("common");
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
          <Button type="button"
            
            onClick={() => setIsCreateOpen(true)}
 >
            <Icon icon={Add01Icon} size="sm" />
            {t("add")}
          </Button>
        }
      />

      {isLoading ? (
        <DocumentCategoriesSkeleton/>
      ) : rows.length === 0 ? (
        <ListEmptyState
          query={query}
          scene="documents"
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          noResultsHint={t("noResultsHint")}
          onCreate={() => setIsCreateOpen(true)}
          createLabel={t("add")}
        />
      ) : (
        <div className="divide-y divide-divider rounded-control border border-divider">
          {rows.map((category) => (
            <div key={category.id} className="flex items-center gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-body font-medium text-primary">
                    {category.name}
                  </span>
                  {category.isSystem && (
                    <Badge variant="neutral" className="font-normal">{t("system")}</Badge>
                  )}
                  {!category.isActive && (
                    <Badge variant="outline" className="font-normal">{t("inactive")}</Badge>
                  )}
                </div>
                {category.description && (
                  <p className="mt-0.5 truncate text-hint text-tertiary">
                    {category.description}
                  </p>
                )}
              </div>

              {category.isSystem ? (
                <span
                  className="text-disabled"
                  title={t("systemLocked")}
 >
                  <Icon icon={SquareLock02Icon} size="sm" />
                </span>
              ) : (
                <div className="flex items-center gap-1">
                  <Button type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("editAria", { name: category.name })}
                    onClick={() => setEditing(category)}
 >
                    <Icon icon={PencilEdit02Icon} size="sm" />
                  </Button>
                  <Button type="button"
                    variant="ghost"
                    size="icon-sm" className="text-tertiary hover:text-danger-text"
                    aria-label={t("deleteAria", { name: category.name })}
                    onClick={() => setToDelete(category)}
 >
                    <Icon icon={Delete02Icon} size="sm" />
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
            // `editing` is the row captured when the dialog opened, so its version is the one the
            // form was filled from. A stale one is refused (E00409) and shown in the open dialog.
            await save.mutateAsync({ id: editing?.id, ...values, version: editing?.version });
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
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.rich("deleteDescription", { name: toDelete?.name ?? "", b: (chunks) => <strong>{chunks}</strong> })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {messageOf(remove.error) && (
            <FormError message={remove.error ? messageOf(remove.error) : null} />
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>{tCommon("actions.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={remove.isPending}
              destructive
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
              {tCommon("actions.delete")}
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
  const t = useTranslations("settings.documentCategories");
  const tCommon = useTranslations("common");
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
          <DialogTitle>{category ? t("editTitle") : t("newTitle")}</DialogTitle>
          <DialogDescription>
            {t("formDescription")}
          </DialogDescription>
        </DialogHeader>

        <FormError message={errorMessage} />

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-2">
            <RequiredLabel htmlFor="category-name" required>{tCommon("fields.name")}</RequiredLabel>
            <Input
              id="category-name"
              autoFocus
              value={name}
              disabled={isLoading}
              onChange={(e) => setName(e.currentTarget.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-description">{tCommon("fields.description")}</Label>
            <Input
              id="category-description"
              value={description}
              disabled={isLoading}
              onChange={(e) => setDescription(e.currentTarget.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-control border border-divider px-3 py-2.5">
            <div>
              <Label htmlFor="category-active" className="text-body">{t("active")}</Label>
              <p className="text-hint text-tertiary">
                {t("activeHint")}
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
            <Button type="button" variant="secondary" disabled={isLoading} onClick={onCancelAction}>
              {tCommon("actions.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
 >
              {isLoading ? tCommon("actions.saving") : tCommon("actions.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
