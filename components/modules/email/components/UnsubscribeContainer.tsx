"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { NodRing } from "@/components/desact/nod";
import { Illustration } from "@/components/illustrations";
import { ActionStatus } from "@/components/models/ActionStatus";
import { undoUnsubscribeEmailAction, unsubscribeEmailAction } from "@/components/modules/email/actions";
import type { UnsubscribeResult } from "@/models/email";

type State =
  | { kind: "working" }
  | { kind: "done"; result: UnsubscribeResult }
  | { kind: "undone" }
  | { kind: "invalid" };

/**
 * Switches the emails off once the page is open, says which, and offers the undo (§ 9.2). The inbox is never
 * touched. A link that no longer works says so instead of failing.
 */
export function UnsubscribeContainer({ token }: { token: string | null }) {
  const t = useTranslations("notifications");
  const [state, setState] = useState<State>(token ? { kind: "working" } : { kind: "invalid" });
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    void unsubscribeEmailAction(token).then((res) => {
      if (res.status === ActionStatus.SUCCESS && res.data) setState({ kind: "done", result: res.data });
      else setState({ kind: "invalid" });
    });
  }, [token]);

  const undo = async () => {
    if (!token) return;
    const res = await undoUnsubscribeEmailAction(token);
    setState(res.status === ActionStatus.SUCCESS ? { kind: "undone" } : { kind: "invalid" });
  };

  const categories = state.kind === "done"
    ? state.result.categories.map((c) => t(`categories.${c}` as "categories.APPROVALS")).join(", ")
    : "";

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      {state.kind === "working" && (
        <>
          <NodRing />
          <p className="text-body text-secondary">{t("unsubscribe.working")}</p>
        </>
      )}
      {state.kind === "invalid" && (
        <>
          <Illustration scene="notifications" />
          <h1 className="text-section-title text-primary">{t("unsubscribe.invalidTitle")}</h1>
          <p className="text-body text-secondary">{t("unsubscribe.invalidBody")}</p>
        </>
      )}
      {state.kind === "done" && (
        <>
          <Illustration scene="notifications" />
          <h1 className="text-section-title text-primary">{t("unsubscribe.title")}</h1>
          <p className="text-body text-secondary">
            {state.result.categories.length > 0
              ? t("unsubscribe.body", { categories })
              : t("unsubscribe.bodyNothing")}
          </p>
          <div className="flex gap-2">
            {state.result.categories.length > 0 && (
              <Button variant="secondary" onClick={() => void undo()}>{t("unsubscribe.undo")}</Button>
            )}
            <Button variant="ghost" asChild>
              <a href="/preferences">{t("unsubscribe.settings")}</a>
            </Button>
          </div>
        </>
      )}
      {state.kind === "undone" && (
        <>
          <Illustration scene="notifications" />
          <p className="text-body text-secondary">{t("unsubscribe.undone")}</p>
        </>
      )}
    </main>
  );
}
