"use client";

import { FC } from "react";
import { useTranslations } from "next-intl";
import { Alert02Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
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
import { AttributeGroup } from "@/models/attribute/AttributeGroup";
import { useGroupDeleteImpact } from "@/components/modules/settings/modules/attributes/hooks/useDeleteImpact";
import { messageForError } from "@/lib/errors/errorMessages";

type DeleteGroupModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  onConfirmAction: () => void;
  onRequestCloseAction: () => void;
  group: AttributeGroup;
};

export const DeleteGroupModal: FC<DeleteGroupModalProps> = ({
  isOpen,
  isLoading = false,
  onConfirmAction,
  onRequestCloseAction,
  group,
}) => {
  const t = useTranslations("settings.attributes.deleteSection");
  const tCommon = useTranslations("common");
  const groupName = group?.name ?? t("untitled");

  const {
    data: impact,
    isLoading: isImpactLoading,
    error: impactError,
  } = useGroupDeleteImpact(isOpen ? group?.id ?? null : null);

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onRequestCloseAction();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 text-left">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-popover bg-mist text-secondary">
              <Icon icon={Delete02Icon} />
            </span>
            <div className="space-y-1">
              <AlertDialogTitle>{t("title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t.rich("description", { name: groupName, b: (chunks) => <strong>{chunks}</strong> })}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="rounded-card border border-divider bg-mist p-4">
          <div className="flex items-start gap-3">
            <Icon icon={Alert02Icon} className="mt-0.5 text-secondary" />

            <div>
              <h4 className="mb-1 font-medium text-primary">{t("warning")}</h4>

              <div className="space-y-1 text-body text-secondary">
                {/*
                  The `else` branch used to catch three different situations \u2014 still loading, failed
                  to load, and genuinely empty \u2014 and told the reader the same vague sentence for all
                  three. Split, following `DeleteRoleModal`.
                */}
                {isImpactLoading && <p>{t("impactLoading")}</p>}

                {!isImpactLoading && !impact && !!impactError && (
                  <p>
                    {t("impactFailed", { error: messageForError(impactError) })}
                  </p>
                )}

                {!isImpactLoading && impact && impact.attributeCount > 0 && (
                  <p>
                    {t.rich(impact.valueCount > 0 ? "impactWithValues" : "impact", {
                      attributeCount: impact.attributeCount,
                      valueCount: impact.valueCount,
                      peopleCount: impact.peopleCount,
                      b: (chunks) => <strong>{chunks}</strong>,
                    })}
                  </p>
                )}

                {!isImpactLoading && impact && impact.attributeCount === 0 && (
                  <p>{t("empty")}</p>
                )}

                {/* Nothing asked yet, and nothing to report: the sentence this block always had. */}
                {!isImpactLoading && !impact && !impactError && (
                  <p>{t("attributesDeleted")}</p>
                )}
                <p>{t("viewsUpdated")}</p>
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{tCommon("actions.cancel")}</AlertDialogCancel>

          {/* Disabled only while the question is still open \u2014 see `DeleteAttributeModal`. */}
          <AlertDialogAction
            disabled={isLoading || isImpactLoading}
            onClick={(event) => {
              event.preventDefault();
              onConfirmAction();
            }}
            destructive
          >
            {t("title")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
