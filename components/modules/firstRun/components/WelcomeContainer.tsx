"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showActionError } from "@/lib/errors/errorToast";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { useAttributeGroups } from "@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups";
import {
  PersonalInfoAttributesRow,
} from "@/components/modules/organization/modules/profile/components/PersonalInfoContainer/components/PersonalInfoAttributesRow/PersonalInfoAttributesRow";
import { updateUserAttributesAction } from "@/components/modules/organization/modules/profile/actions/updateUserAttributesAction";
import { AvatarWithQr } from "@/components/modules/firstRun/components/AvatarWithQr";
import { PersonalPreferencesForm } from "@/components/modules/firstRun/components/PersonalPreferencesForm";
import { completeWelcomeAction } from "@/components/modules/firstRun/actions";
import { WELCOME_QK, useWelcome } from "@/components/modules/firstRun/hooks";
import type { Attribute } from "@/models/attribute/Attribute";

const ATTR_PREFIX = "attr:";

/**
 * The first screen an invited person sees, and the last one before the product.
 *
 * <h2>Two steps, both skippable, and skipping is an answer</h2>
 *
 * Nothing here is a gate. Somebody who wants to get on with their day presses Skip twice and lands
 * in the product, and the welcome does not come back tomorrow to ask again — `Skip` says skip, not
 * later. It is reachable afterwards from the user menu, which is the honest way to offer a second
 * chance: on their terms rather than on ours.
 *
 * <h2>What step one asks for</h2>
 *
 * Whatever this person may edit about themselves, decided on the server, plus their photo. With the
 * roles as they ship that list is usually empty and the step is the photo alone — see
 * `WelcomeService` for why that is the right answer rather than something to work around here.
 */
export const WelcomeContainer: React.FC = () => {
  const queryClient = useQueryClient();
  const { userId } = useCurrentUser();
  const welcome = useWelcome();
  const groups = useAttributeGroups();

  const [step, setStep] = React.useState(0);
  const [values, setValues] = React.useState<Record<string, unknown>>({});
  const [seeded, setSeeded] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!welcome.data || seeded) return;
    setValues(welcome.data.values ?? {});
    setSeeded(true);
  }, [welcome.data, seeded]);

  const editable = React.useMemo<Attribute[]>(() => {
    const wanted = new Set(
      (welcome.data?.fields ?? [])
        .map((f) => f.id)
        .filter((id): id is string => Boolean(id) && id.startsWith(ATTR_PREFIX))
        .map((id) => id.slice(ATTR_PREFIX.length)),
    );
    if (!wanted.size) return [];

    // The catalogue comes from `/groups`, which every employee may read — the same list the profile
    // renders from, so a field looks and validates identically in both places.
    return (groups.data ?? [])
      .flatMap((group) => group.attributes)
      .filter((attribute) => wanted.has(attribute.id));
  }, [welcome.data, groups.data]);

  const refreshWelcome = React.useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: WELCOME_QK });
  }, [queryClient]);

  const leave = React.useCallback(async () => {
    const res = await completeWelcomeAction();
    if (res.status !== ActionStatus.SUCCESS) {
      showActionError(res);
      return;
    }
    // A real navigation, not a router push: the gate that sent us here is a server layout, and it is
    // only re-evaluated on a request.
    window.location.assign("/dashboard");
  }, []);

  if (welcome.error) return <ErrorState error={welcome.error} />;

  // Nothing is drawn until the answer is here. Rendering the header first meant greeting "Welcome"
  // with no name, over an avatar reading "Y" for *You*, under a subtitle about a photo — and then
  // rewriting all three a moment later. A screen that does not know yet says so; it does not guess.
  if (!welcome.data || groups.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const firstName = welcome.data?.firstName ?? "";
  const fullName = `${welcome.data?.firstName ?? ""} ${welcome.data?.lastName ?? ""}`.trim();

  const saveStepOne = async () => {
    setBusy(true);
    if (editable.length && userId) {
      const payload: Record<string, unknown> = {};
      for (const attribute of editable) payload[attribute.id] = values[`${ATTR_PREFIX}${attribute.id}`];

      const res = await updateUserAttributesAction({ userId, values: payload });
      if (res.status !== ActionStatus.SUCCESS) {
        setBusy(false);
        showActionError(res);
        return;
      }
    }
    setBusy(false);
    setStep(1);
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-8 px-4 py-16">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">Step {step + 1} of 2</p>
        <h1 className="text-3xl font-semibold leading-tight text-foreground">
          {step === 0
            ? firstName
              ? `Welcome, ${firstName}`
              : "Welcome"
            : "How would you like things shown?"}
        </h1>
        <p className="text-muted-foreground">
          {step === 0
            ? editable.length
              ? "A photo so colleagues can put a face to your name, and anything of yours that is still blank."
              : "A photo, so colleagues can put a face to your name."
            : "Two settings, and you can change them whenever you like."}
        </p>
      </header>

      {step === 0 ? (
        <div className="grid gap-10 md:grid-cols-[14rem_1fr]">
          <AvatarWithQr
            userId={userId ?? ""}
            fullName={fullName || firstName || "You"}
            avatarUrl={welcome.data?.avatarUrl ?? null}
            onUploadedAction={refreshWelcome}
          />

          <div className="min-w-0">
            {editable.length === 0 ? (
              // Not an error and not an empty state to apologise for: there is genuinely nothing this
              // person owns about themselves to fill in, so the step is the photo. The sentence is
              // true for everybody — the owner of the company is not "your HR team".
              <p className="text-sm text-muted-foreground">
                Everything else about you lives on your profile, where you can change it any time.
              </p>
            ) : (
              <div className="divide-y divide-brown-100">
                {editable.map((attribute) => (
                  <PersonalInfoAttributesRow
                    key={attribute.id}
                    attribute={attribute}
                    rawValue={values[`${ATTR_PREFIX}${attribute.id}`]}
                    isEdit
                    wasFilled={Boolean(welcome.data?.values?.[`${ATTR_PREFIX}${attribute.id}`])}
                    onChange={(v) =>
                      setValues((current) => ({ ...current, [`${ATTR_PREFIX}${attribute.id}`]: v }))
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-lg">
          <PersonalPreferencesForm hideSubmit formId="welcome-preferences" onSavedAction={leave} />
        </div>
      )}

      {/*
        `type` and `key` are both load-bearing here, and the bug they fix took a live click to find.

        A `Button` sets no type, so a button's type is the HTML default — **submit**. And the two
        branches below sit in the same slot of the same ternary, so React reused one DOM node for
        both: clicking Next ran `setStep(1)`, React flushed it synchronously (a click is a discrete
        event), and by the time the browser got to the click's default action that same node had
        become `Finish` with `form="welcome-preferences"` on it. So it submitted the preferences
        form — whose success handler leaves for the dashboard. One click, and step two was gone.

        `type="button"` means there is no default action to inherit; the keys mean the node is never
        reused in the first place. Either would have fixed this one; both say what is intended.
      */}
      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={leave} disabled={busy}>
          Skip
        </Button>

        {step === 0 ? (
          <Button key="next" type="button" onClick={saveStepOne} disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Next
          </Button>
        ) : (
          <Button key="finish" type="submit" form="welcome-preferences">
            Finish
          </Button>
        )}
      </div>
    </div>
  );
};
