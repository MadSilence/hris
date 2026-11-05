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
import { Attribute } from "@/models/attribute/Attribute";
import { AttributeType } from "@/models/attribute";
import { useAttributeDeleteImpact } from "@/components/modules/settings/modules/attributes/hooks/useDeleteImpact";
import { messageForError } from "@/lib/errors/errorMessages";

type DeleteAttributeModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  onConfirmAction: () => void;
  onRequestCloseAction: () => void;
  attribute: Attribute;
};

export const DeleteAttributeModal: FC<DeleteAttributeModalProps> = ({
  isOpen,
  isLoading = false,
  onConfirmAction,
  onRequestCloseAction,
  attribute,
}) => {
  const t = useTranslations("settings.attributes.deleteModal");
  const tCommon = useTranslations("common");
  const attributeName = attribute?.name ?? t("untitled");

  const {
    data: impact,
    isLoading: isImpactLoading,
    error: impactError,
  } = useAttributeDeleteImpact(isOpen ? attribute?.id ?? null : null);

  const hasOptions =
    attribute?.type === AttributeType.MULTI_SELECT ||
    attribute?.type === AttributeType.SELECT;

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
                {t.rich("description", { name: attributeName, b: (chunks) => <strong>{chunks}</strong> })}
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
                {hasOptions && (
                  <p>{t("optionsDeleted")}</p>
                )}

                {/*
                  Three outcomes, not two. This block read `impact &&` alone, so "we have not asked
                  yet" and "we asked and could not get an answer" both rendered as silence \u2014 and
                  silence here is indistinguishable from "this attribute has no values", which is
                  the one thing the reader is trying to find out before pressing Delete. The pattern
                  is `DeleteRoleModal`, one folder away.
                */}
                {isImpactLoading && <p>{t("impactLoading")}</p>}

                {!isImpactLoading && !impact && !!impactError && (
                  <p>
                    {t("impactFailed", { error: messageForError(impactError) })}
                  </p>
                )}

                {!isImpactLoading && impact && impact.valueCount > 0 && (
                  <p>
                    {t.rich("impact", {
                      valueCount: impact.valueCount,
                      peopleCount: impact.peopleCount,
                      b: (chunks) => <strong>{chunks}</strong>,
                    })}
                  </p>
                )}

                {!isImpactLoading && impact && impact.valueCount === 0 && (
                  <p>{t("noValues")}</p>
                )}

                {/* Nothing asked yet, and nothing to report. */}
                {!isImpactLoading && !impact && !impactError && (
                  <p>{t("valuesDeleted")}</p>
                )}

                <p>{t("viewsUpdated")}</p>
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{tCommon("actions.cancel")}</AlertDialogCancel>

          {/*
            Disabled *only* while the question is still open. Once the answer is in \u2014 or once we
            know it is not coming \u2014 the decision is the admin's to make; refusing to delete because
            an impact endpoint is down would be a second failure on top of the first.
          */}
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
