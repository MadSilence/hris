"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/desact/button";
import { NodRing } from "@/components/desact/nod";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { useAttributeGroups } from "@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups";
import {
  PersonalInfoAttributesRow,
} from "@/components/modules/organization/modules/profile/components/PersonalInfoContainer/components/PersonalInfoAttributesRow/PersonalInfoAttributesRow";
import { updateUserAttributesAction } from "@/components/modules/organization/modules/profile/actions/updateUserAttributesAction";
import { AuthBack } from "@/components/modules/auth/layout";
import { WELCOME_QK, useWelcome } from "@/components/modules/firstRun/hooks";
import type { Attribute } from "@/models/attribute/Attribute";
import { WelcomeFrame, type FirstRunCompany } from "./FirstRunPieces";
import { ATTR_PREFIX, isBlankValue, ownEditableAttributes } from "./ownFields";

/**
 * *Finish your profile* (`/profile/finish`, the designers' screen `profile-finish`, fix P2): the welcome's W3 without
 * its stepper, reached from the user menu while the person still has a blank field of their own to fill.
 *
 * <p>The fields are those the welcome would ask (`WelcomeService`: the person's own attributes they may edit about
 * themselves), blank ones only, in My profile's order, drawn by the profile's own row so each looks and validates as
 * it does there. The list is taken once, when the page opens: a field filled while it is open stays on it.
 *
 * <p>*Save* writes what was filled and goes back where the person came from; *Not now* goes back without saving. A
 * failed save keeps what was typed and offers Retry.
 */
export const FinishProfileContainer: React.FC<{ company: FirstRunCompany }> = ({ company }) => {
  const t = useTranslations("firstRun");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { userId } = useCurrentUser();
  const welcome = useWelcome();
  const groups = useAttributeGroups();

  const [fields, setFields] = React.useState<Attribute[] | null>(null);
  const [values, setValues] = React.useState<Record<string, unknown>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (fields !== null || !welcome.data || groups.isLoading) return;
    const stored = welcome.data.values ?? {};
    setFields(
      ownEditableAttributes(welcome.data, groups.data).filter((attribute) =>
        isBlankValue(stored[`${ATTR_PREFIX}${attribute.id}`]),
      ),
    );
  }, [fields, welcome.data, groups.data, groups.isLoading]);

  const goBack = React.useCallback(() => {
    // Back where the person came from; opened on its own (a typed address), the product's home.
    if (window.history.length > 1) router.back();
    else router.push("/dashboard");
  }, [router]);

  const save = async () => {
    if (Object.keys(errors).length > 0) return;
    const filled: Record<string, unknown> = {};
    for (const attribute of fields ?? []) {
      const value = values[attribute.id];
      if (!isBlankValue(value)) filled[attribute.id] = value;
    }
    if (!userId || Object.keys(filled).length === 0) {
      goBack();
      return;
    }

    setBusy(true);
    const res = await updateUserAttributesAction({ userId, values: filled });
    setBusy(false);
    if (res.status !== ActionStatus.SUCCESS) {
      toast.error(t("finishProfile.saveFailed"), {
        action: { label: t("finishProfile.retry"), onClick: () => void saveRef.current() },
      });
      return;
    }
    // The user menu offers this page only while a field is blank; it asks again on the next read.
    void queryClient.invalidateQueries({ queryKey: WELCOME_QK });
    goBack();
  };

  // Retry runs the latest save, with whatever is typed by then.
  const saveRef = React.useRef(save);
  saveRef.current = save;

  // Nothing to finish (an old link, a typed address): back where they came from rather than an empty form — walked
  // 2026-11-19, the page opened with its title and Save over no fields.
  const nothingToFinish = fields !== null && fields.length === 0;
  React.useEffect(() => {
    if (nothingToFinish) goBack();
  }, [nothingToFinish, goBack]);

  if (welcome.error) return <ErrorState error={welcome.error} />;

  if (fields === null || nothingToFinish) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <NodRing size="md" label="" className="text-tertiary" />
      </div>
    );
  }

  return (
    <WelcomeFrame company={company} back={<AuthBack onClick={goBack} />}>
      <div className="fr-head-centred flex flex-col gap-2">
        <h1 className="text-auth-title text-primary">{t("finishProfile.title")}</h1>
        <p className="text-auth-lead text-secondary">{t("finishProfile.lead")}</p>
      </div>
      {fields.length > 0 && (
        <div className="divide-y divide-divider">
          {fields.map((attribute) => (
            <PersonalInfoAttributesRow
              key={attribute.id}
              attribute={attribute}
              rawValue={values[attribute.id]}
              isEdit
              onChange={(v) => setValues((current) => ({ ...current, [attribute.id]: v }))}
              onValidityChange={(error) =>
                setErrors((current) => {
                  if (error) return { ...current, [attribute.id]: error };
                  if (!(attribute.id in current)) return current;
                  const { [attribute.id]: _gone, ...rest } = current;
                  return rest;
                })}
            />
          ))}
        </div>
      )}
      <div className="flex flex-col gap-3">
        <Button type="button" size="lg" className="w-full" onClick={() => void save()} loading={busy} loadingLabel={tCommon("actions.saving")}>
          {t("finishProfile.save")}
        </Button>
        <button type="button" className="fr-skip" onClick={goBack}>
          {t("finishProfile.notNow")}
        </button>
      </div>
    </WelcomeFrame>
  );
};
