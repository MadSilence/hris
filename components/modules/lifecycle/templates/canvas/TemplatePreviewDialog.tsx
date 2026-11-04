"use client";

import React, { useMemo } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/desact/dialog";
import { useAttributeGroups } from "@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups";
import { useDocumentCategories } from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/useDocumentCategories";
import { internalApiClient } from "@/components/clients/apiClient";
import { showError } from "@/lib/errors/errorToast";
import { dateToISO, formatDisplayDate } from "@/lib/date";
import { PreboardingPageContainer } from "@/components/modules/lifecycle/preboarding/PreboardingPageContainer";
import { TaskList } from "@/components/modules/lifecycle/tasks/TaskList";
import { saveBlob } from "@/components/modules/lifecycle/tasks/TaskMaterials";
import type { Material, PreboardingPage, ProcessType, Task } from "@/models/lifecycle";
import { timelineOrder, type DraftItem } from "./draft";

type Props = {
  open: boolean;
  type: ProcessType;
  name: string;
  items: DraftItem[];
  onCloseAction: () => void;
};

/** The example date the preview counts from: two weeks ahead, so "before" and "after" both read naturally. */
const EXAMPLE_LEAD_DAYS = 14;

const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return dateToISO(d);
};

const openFile = async (material: Material) => {
  if (!material.fileId) return;
  try {
    const res = await internalApiClient.fetch(`/lifecycle/files/${material.fileId}/download`, { method: "GET" });
    saveBlob(await res.blob(), material.name ?? "file");
  } catch (e) {
    showError(e);
  }
};

/**
 * What the person the process is about will see, from the template as it stands — the tasks of their own lane,
 * the way their surface draws them: the preboarding page for a joiner with no account, the Tasks tab for
 * somebody in the app. Fields and questions can be tried; nothing is sent. Dates count from an example day
 * two weeks ahead, and every task shows as open (a task that waits is not shown to them until it opens).
 */
export function TemplatePreviewDialog({ open, type, name, items, onCloseAction }: Props) {
  const { data: groups } = useAttributeGroups();
  const { data: categories } = useDocumentCategories();

  const anchor = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + EXAMPLE_LEAD_DAYS);
    return dateToISO(d);
  }, []);

  const own = useMemo(() => items.filter((i) => i.assigneeKind === "TARGET").sort(timelineOrder), [items]);
  const attributes = useMemo(
    () => new Map((groups ?? []).flatMap((g) => g.attributes ?? []).map((a) => [a.id, a])),
    [groups],
  );
  const categoryName = (id: string | null) => (id ? (categories ?? []).find((c) => c.id === id)?.name ?? null : null);
  const dueOf = (i: DraftItem) => (i.dueKind === "BEFORE_START" ? anchor : addDays(anchor, i.offsetDays ?? 0));
  const fieldsOf = (i: DraftItem) => i.attributeIds.map((id) => {
    const a = attributes.get(id);
    return {
      id,
      name: a?.name ?? "Field",
      type: a ? String(a.type) : "TEXT",
      isRequired: Boolean(a?.required),
      isFilled: false,
      options: (a?.options ?? []).map((o) => ({ id: o.id, label: o.value })),
    };
  });

  const page: PreboardingPage = {
    firstName: "Alex",
    companyName: null,
    startDate: anchor,
    tasks: own.map((i) => ({
      id: i.key,
      kind: i.kind,
      title: i.title || "Untitled task",
      description: i.description || null,
      status: "OPEN",
      dueKind: i.dueKind,
      dueDate: dueOf(i),
      fields: i.kind === "FILL_FIELDS" ? fieldsOf(i) : null,
      categoryName: categoryName(i.categoryId),
      materials: i.materials,
      questions: i.kind === "QUESTIONNAIRE" ? i.questions : null,
      commentCount: 0,
    })),
  };

  const tasks: Task[] = own.map((i) => ({
    id: i.key,
    kind: i.kind,
    title: i.title || "Untitled task",
    description: i.description || null,
    status: "OPEN",
    dueKind: i.dueKind,
    dueDate: dueOf(i),
    dueReached: false,
    subject: { id: "preview", name: "Alex" },
    assigneeKind: "TARGET",
    assignee: { id: "preview", name: "Alex" },
    processId: null,
    processType: type,
    fields: i.kind === "FILL_FIELDS"
      ? fieldsOf(i).map((f) => ({ id: f.id, name: f.name, type: f.type, filled: false, isRequired: f.isRequired, options: f.options }))
      : null,
    category: i.categoryId ? { id: i.categoryId, name: categoryName(i.categoryId) } : null,
    completedAt: null,
    waitingFor: [],
    materials: i.materials,
    questions: i.kind === "QUESTIONNAIRE" ? i.questions : null,
    commentCount: 0,
  }));

  const counted = type === "OFFBOARDING" ? "last working day" : "start day";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCloseAction(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Preview · {name || "Untitled template"}</DialogTitle>
          <DialogDescription>
            {type === "PREBOARDING"
              ? "The page the new person opens from their link, before they have an account."
              : "The person's Tasks, as they will see them in the app."}{" "}
            Dates count from an example {counted}, {formatDisplayDate(anchor, { style: "medium" })}. Fields and
            questions can be tried; nothing is sent.
          </DialogDescription>
        </DialogHeader>

        {own.length === 0 ? (
          <p className="py-10 text-center text-body text-tertiary">
            Nothing here is the person&apos;s to do: every task is for somebody else. Add one in their row of the
            timeline.
          </p>
        ) : type === "PREBOARDING" ? (
          <div className="rounded-popover bg-subtle/50 px-4" data-test="template-preview">
            <PreboardingPageContainer key={JSON.stringify(page)} token="" initialPage={page} preview onOpenFile={(m) => void openFile(m)} />
          </div>
        ) : (
          <div data-test="template-preview">
            <TaskList tasks={tasks} preview onCompleteAction={() => undefined} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
