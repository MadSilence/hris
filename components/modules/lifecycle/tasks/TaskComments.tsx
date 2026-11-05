"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { Textarea } from "@/components/desact/textarea";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useDateFormatter } from "@/lib/date";
import type { TaskComment } from "@/models/lifecycle";

const MAX_LENGTH = 4000;

type Result = { status: ActionStatus; data?: TaskComment[]; errorMessage?: string };

/**
 * A task's comments — and the messages of a process, which has no other thread (DECISIONS.md § "Lifecycle
 * tasks", C3). The surface supplies how to read and how to write: the app through its session, the preboarding
 * page through its token. Writing answers with the whole thread.
 */
export function TaskComments({ load, send }: {
  load: () => Promise<Result>;
  send: (body: string) => Promise<Result>;
}) {
  const formatDisplayDate = useDateFormatter();
  const t = useTranslations("lifecycle");
  const tCommon = useTranslations("common");
  const [comments, setComments] = useState<TaskComment[] | null>(null);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    load().then((res) => {
      if (!alive) return;
      if (res.status === ActionStatus.SUCCESS && res.data) setComments(res.data);
      else setError(res.errorMessage ?? t("comments.loadFailed"));
    });
    return () => { alive = false; };
    // Read once when the thread opens; a write answers with the new thread.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    const text = body.trim();
    if (!text) return;
    setBusy(true);
    setError(null);
    try {
      const res = await send(text);
      if (res.status === ActionStatus.SUCCESS && res.data) {
        setComments(res.data);
        setBody("");
      } else {
        setError(res.errorMessage ?? null);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3 space-y-3 rounded-control bg-subtle p-3" data-test="task-comments">
      {comments === null && !error && <p className="text-hint text-tertiary">{t("comments.loading")}</p>}
      {comments?.length === 0 && <p className="text-hint text-tertiary">{t("comments.empty")}</p>}
      {comments && comments.length > 0 && (
        <ul className="space-y-2">
          {comments.map((c) => (
            <li key={c.id} className={`text-body ${c.mine ? "pl-6" : "pr-6"}`}>
              <p className="text-hint text-tertiary">
                {t("comments.byLine", {
                  author: c.mine ? t("comments.you") : c.author?.name ?? t("comments.somebody"),
                  date: formatDisplayDate(c.createdAt, { style: "medium" }),
                })}
              </p>
              <p className="whitespace-pre-wrap">{c.body}</p>
            </li>
          ))}
        </ul>
      )}
      <div className="space-y-2">
        <Textarea
          aria-label={t("comments.write")}
          placeholder={t("comments.write")}
          value={body}
          maxLength={MAX_LENGTH}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void submit();
            }
          }}
          disabled={busy}
          rows={2}
        />
        <Button type="button" size="sm" disabled={busy || !body.trim()} onClick={() => void submit()}>
          {tCommon("actions.send")}
        </Button>
        <FormError message={error} />
      </div>
    </div>
  );
}
