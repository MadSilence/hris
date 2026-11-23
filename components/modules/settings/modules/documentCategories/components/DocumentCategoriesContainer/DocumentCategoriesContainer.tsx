"use client";

import { FC, FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { FormError } from "@/components/feedback/FormError";
import { FieldError } from "@/components/desact/field-error";
import { Add01Icon, Delete02Icon, PencilEdit02Icon, SquareLock02Icon, UserMultipleIcon, ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons";
import { Checkbox } from "@/components/desact/checkbox";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/desact/icon";

import { Badge } from "@/components/desact/badge";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { Switch } from "@/components/desact/switch";
import { Skeleton } from "@/components/desact/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/desact/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import type { DocumentCategoryDTO, DocumentCategoryDeleteImpactDTO } from "@/api/modules/documents/dto";
import {
  useDocumentCategories,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/useDocumentCategories";
import {
  useDeleteDocumentCategory,
  useSaveDocumentCategory,
} from "@/components/modules/settings/modules/documentCategories/hooks/useDocumentCategoryMutations";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { ListEmptyState } from "@/components/feedback/ListEmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { DocumentCategoriesSkeleton } from "./DocumentCategoriesSkeleton";

const messageOf = (error: unknown): string | null =>
  error instanceof Error ? error.message : null;

/**
 * Settings › People › Document categories (documents-expiry X07, documents-categories AQ-19). A category has no
 * description and no Active switch: its ⋯ holds Edit and Delete, and deleting one that documents carry asks whether
 * they keep the tag or move to another category. A category deleted with "keep" stays on its documents and leaves
 * this list and every picker.
 */
export const DocumentCategoriesContainer: FC = () => {
  const t = useTranslations("settings.documentCategories");
  const { data: categories, isLoading } = useDocumentCategories();
  const save = useSaveDocumentCategory();

  const [editing, setEditing] = useState<DocumentCategoryDTO | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState<DocumentCategoryDTO | null>(null);

  const isFormOpen = isCreateOpen || !!editing;

  // A retired category (deleted with "keep") is gone for the people who manage the list.
  const all = (categories ?? []).filter((category) => category.isActive);

  const needle = query.trim().toLowerCase();
  const rows = needle ? all.filter((category) => category.name.toLowerCase().includes(needle)) : all;

  return (
    <div className="space-y-4">
      <ListToolbar
        search={{ value: query, onChange: setQuery }}
        primary={
          <Button type="button" onClick={() => setIsCreateOpen(true)}>
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
                </div>
                <p className="mt-0.5 truncate text-hint text-tertiary">
                  <CategorySummary category={category} />
                </p>
              </div>

              {category.isSystem ? (
                <span className="text-disabled" title={t("systemLocked")}>
                  <Icon icon={SquareLock02Icon} size="sm" />
                </span>
              ) : (
                <RowActionsMenu label={t("actionsAria", { name: category.name })}>
                  <RowAction icon={<Icon icon={PencilEdit02Icon} size="sm" />} onClick={() => setEditing(category)}>
                    {t("edit")}
                  </RowAction>
                  <RowActionDestructive icon={<Icon icon={Delete02Icon} size="sm" />} onClick={() => setToDelete(category)}>
                    {t("delete")}
                  </RowActionDestructive>
                </RowActionsMenu>
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

      <DeleteCategoryDialog
        category={toDelete}
        others={all.filter((category) => category.id !== toDelete?.id)}
        onCloseAction={() => setToDelete(null)}
      />
    </div>
  );
};

/** The row's second line (AQ19a): "Expiry date required · remind 60 days before · visible to the person". */
function CategorySummary({ category }: { category: DocumentCategoryDTO }) {
  const t = useTranslations("settings.documentCategories");
  const parts = [
    category.requiresExpiry
      ? t("summary.expiryRequired")
      : category.remindDaysBefore != null ? t("summary.expiryOptional") : t("summary.noExpiry"),
  ];
  if (category.remindDaysBefore != null) parts.push(t("summary.remind", { count: category.remindDaysBefore }));
  parts.push(category.defaultVisibility === "VISIBLE_TO_EMPLOYEE"
    ? t("summary.visible")
    : category.defaultVisibility === "HR_ONLY" ? t("summary.hidden") : t("summary.uploaderDecides"));
  return <>{parts.join(" · ")}</>;
}

/**
 * AQ19b–d. A category nobody uses gets a plain confirm; one documents carry asks what happens to them — "Keep them as
 * they are" (the default: they keep the tag, nobody picks it again) or "Move them to another category", with a select.
 */
function DeleteCategoryDialog({ category, others, onCloseAction }: {
  category: DocumentCategoryDTO | null;
  /** The categories the documents may move to: in use, not this one. */
  others: DocumentCategoryDTO[];
  onCloseAction: () => void;
}) {
  const t = useTranslations("settings.documentCategories");
  const tCommon = useTranslations("common");
  const { internalApiClient } = useAppDataContext();
  const remove = useDeleteDocumentCategory();
  const [strategy, setStrategy] = useState<"KEEP" | "MOVE">("KEEP");
  const [target, setTarget] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  const open = category !== null;
  const impact = useQuery<DocumentCategoryDeleteImpactDTO>({
    queryKey: ["DOCUMENT_CATEGORY_DELETE_IMPACT", category?.id],
    enabled: open,
    staleTime: 0,
    queryFn: () => internalApiClient.get<DocumentCategoryDeleteImpactDTO>(`/documents/categories/${category?.id}/delete-impact`),
  });

  useEffect(() => {
    if (!open) return;
    setStrategy("KEEP");
    setTarget(null);
    setTried(false);
    remove.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset once per opening
  }, [open, category?.id]);

  const name = category?.name ?? "";
  const count = impact.data?.documents ?? 0;
  // W10: the trash counts too — a move re-tags it, so the sentence and the choice both see it.
  const trashed = impact.data?.trashed ?? 0;
  const used = count + trashed > 0;
  const moving = used && strategy === "MOVE";
  const missingTarget = moving && !target;

  const confirm = async () => {
    if (!category || remove.isPending) return;
    setTried(true);
    if (missingTarget) return;
    try {
      await remove.mutateAsync({ id: category.id, strategy: moving ? "MOVE" : "KEEP", targetCategoryId: moving ? target : null });
      onCloseAction();
    } catch {
      // Shown in the dialog.
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && !remove.isPending) onCloseAction(); }}>
      <DialogContent size="md">
        <form
          noValidate
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void confirm();
          }}
        >
          <DialogHeader>
            <DialogTitle>{t("deleteTitle", { name })}</DialogTitle>
            {/* A div, not the default <p>: the skeleton is a div, and a div in a p is invalid (walk of 2026-11-23). */}
            <DialogDescription asChild>
              <div>{impact.isLoading ? <Skeleton className="h-4 w-48" /> : trashed > 0 ? t("deleteCountWithTrash", { count, trashed }) : t("deleteCount", { count })}</div>
            </DialogDescription>
          </DialogHeader>

          {impact.isError && <ErrorState compact error={impact.error} onRetry={() => void impact.refetch()} />}

          {used && (
            <RadioGroup value={strategy} onValueChange={(v) => setStrategy(v as "KEEP" | "MOVE")} className="gap-4">
              <label className="flex cursor-pointer items-start gap-3">
                <RadioGroupItem value="KEEP" className="mt-0.5" aria-label={t("keep")} />
                <span className="flex flex-col gap-0.5">
                  <span className="text-body text-primary">{t("keep")}</span>
                  <span className="text-hint text-tertiary">{t("keepHint", { name })}</span>
                </span>
              </label>
              <div className="flex items-start gap-3">
                <RadioGroupItem id="category-delete-move" value="MOVE" className="mt-0.5" aria-label={t("move")} />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <label htmlFor="category-delete-move" className="cursor-pointer text-body text-primary">{t("move")}</label>
                  {moving && (
                    <div>
                      <SearchableSelect
                        id="category-delete-target"
                        options={others.map((c) => ({ value: c.id, label: c.name }))}
                        value={target}
                        onChange={setTarget}
                        placeholder={t("moveTo")}
                      />
                      <FieldError>{tried && missingTarget ? t("moveToRequired") : null}</FieldError>
                    </div>
                  )}
                </div>
              </div>
            </RadioGroup>
          )}

          <FormError message={messageOf(remove.error)} />

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onCloseAction}>{tCommon("actions.cancel")}</Button>
            <Button type="submit" variant="destructive-confirm" loading={remove.isPending}>
              {moving ? t("deleteAndMove") : t("deleteConfirm")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type FormValues = {
  name: string;
  requiresExpiry: boolean;
  remindDaysBefore: number;
  defaultVisibility: "HR_ONLY" | "VISIBLE_TO_EMPLOYEE" | "";
};

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
  const [requiresExpiry, setRequiresExpiry] = useState(false);
  const [remind, setRemind] = useState(true);
  const [remindDays, setRemindDays] = useState("30");
  const [defaultVisibility, setDefaultVisibility] = useState<"HR_ONLY" | "VISIBLE_TO_EMPLOYEE" | "">("");
  const [tried, setTried] = useState(false);
  const tExpiry = useTranslations("signing");

  useEffect(() => {
    if (!isOpen) return;
    setTried(false);
    setName(category?.name ?? "");
    setRequiresExpiry(category?.requiresExpiry ?? false);
    setRemind(category ? category.remindDaysBefore != null : true);
    setRemindDays(String(category?.remindDaysBefore ?? 30));
    setDefaultVisibility(category?.defaultVisibility ?? "");
  }, [isOpen, category]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setTried(true);
    if (!name.trim()) return;
    const days = Number(remindDays);
    if (remind && (!Number.isInteger(days) || days < 1 || days > 365)) return;
    onSubmitAction({
      name: name.trim(),
      requiresExpiry,
      remindDaysBefore: remind ? days : 0,
      defaultVisibility,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onCancelAction()}>
      <DialogContent hideClose size="md">
        <DialogHeader>
          <DialogTitle>{category ? t("editTitle") : t("newTitle")}</DialogTitle>
          {/* X07: an edited category is named under the title; a new one still says what categories are for. */}
          <DialogDescription>
            {category ? category.name : t("formDescription")}
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
            <FieldError>{tried && !name.trim() ? tCommon("validation.enterName") : null}</FieldError>
          </div>

          {/* documents-expiry X07 (X10): the expiry rule, the reminder and who sees a new file — no boxes around them. */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="category-requires-expiry" className="text-body font-medium">{tExpiry("category.needsExpiry")}</Label>
              <p className="text-hint text-tertiary">{tExpiry("category.needsExpiryHint")}</p>
            </div>
            <Switch id="category-requires-expiry" checked={requiresExpiry} disabled={isLoading} onCheckedChange={setRequiresExpiry} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category-remind-days" className="text-body font-medium">{tExpiry("category.remindBefore")}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="category-remind-days"
                aria-label={tExpiry("category.days")}
                className={cn("w-24", !remind && "opacity-50")}
                inputMode="numeric"
                value={remindDays}
                readOnly={!remind}
                disabled={isLoading}
                aria-invalid={tried && remind && !(Number(remindDays) >= 1 && Number(remindDays) <= 365) ? true : undefined}
                onChange={(e) => setRemindDays(e.currentTarget.value.replace(/\D/g, ""))}
              />
              <span className="text-body text-tertiary">{tExpiry("category.daysBeforeShort")}</span>
              <label className="ml-auto flex cursor-pointer items-center gap-2 text-body text-primary">
                <Checkbox checked={!remind} disabled={isLoading} onCheckedChange={(on) => setRemind(!on)} />
                {tExpiry("category.dontRemind")}
              </label>
            </div>
            <FieldError>
              {tried && remind && !(Number(remindDays) >= 1 && Number(remindDays) <= 365) ? tExpiry("category.daysRange") : null}
            </FieldError>
            <p className="text-hint text-tertiary">{tExpiry("category.remindHint")}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-body font-medium">{tExpiry("category.whoSeesNew")}</Label>
            <div role="radiogroup" aria-label={tExpiry("category.whoSeesNew")} className="flex flex-col gap-0.5 rounded-control bg-mist p-0.5">
              {([
                { value: "HR_ONLY", label: tExpiry("category.hiddenFromPerson"), icon: ViewOffSlashIcon },
                { value: "VISIBLE_TO_EMPLOYEE", label: tExpiry("category.visibleToPerson"), icon: ViewIcon },
                { value: "", label: tExpiry("category.uploaderDecides"), icon: UserMultipleIcon },
              ] as const).map((o) => (
                <button
                  key={o.value || "uploader"}
                  type="button"
                  role="radio"
                  aria-checked={defaultVisibility === o.value}
                  disabled={isLoading}
                  onClick={() => setDefaultVisibility(o.value)}
                  className={cn(
                    "flex h-[34px] items-center gap-2 rounded-tag px-3 text-left text-label",
                    defaultVisibility === o.value ? "bg-card font-medium text-primary shadow-segment" : "text-secondary hover:text-primary",
                  )}
                >
                  <Icon icon={o.icon} size="sm" />
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" disabled={isLoading} onClick={onCancelAction}>
              {tCommon("actions.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              loading={isLoading}
              loadingLabel={tCommon("actions.saving")}
 >
              {tCommon("actions.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
