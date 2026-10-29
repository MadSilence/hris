"use client";

import React, { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Switch } from "@/public/desact/src/components/ui/switch";
import { FormError } from "@/components/feedback/FormError";
import { messageForError } from "@/lib/errors/errorMessages";
import type { HomeWidgetPlacement } from "@/models/home";
import type { HomeWidgetDefinition } from "@/components/modules/home/widgets";
import {
  HOME_GROUPS,
  HOME_GROUP_LABELS,
  arrangeHome,
  moveWidget,
  setWidgetHidden,
  toPlacements,
  widgetsOf,
  type ArrangedWidget,
} from "@/components/modules/home/layout";

/**
 * Customize: show or hide each widget and move it up or down inside its group (H2). Up and down buttons
 * rather than dragging — the list is short, the buttons work from a keyboard, and nothing about a widget's
 * place is spatial enough to need a drag. Only widgets the reader may see are listed.
 *
 * The draft is local until **Done**, which saves the whole arrangement once; **Cancel** drops it, and
 * **Reset to Default** saves the empty arrangement — "never arranged" and "reset" are the same row.
 */
export const CustomizeHome: React.FC<{
  available: HomeWidgetDefinition[];
  stored: HomeWidgetPlacement[];
  saving: boolean;
  onSave: (placements: HomeWidgetPlacement[]) => Promise<void>;
  onCancel: () => void;
}> = ({ available, stored, saving, onSave, onCancel }) => {
  const [draft, setDraft] = useState<ArrangedWidget<HomeWidgetDefinition>[]>(() => arrangeHome(available, stored));
  const [error, setError] = useState<string | null>(null);

  const save = async (placements: HomeWidgetPlacement[]) => {
    setError(null);
    try {
      await onSave(placements);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : messageForError(caught));
    }
  };

  return (
    <div className="flex flex-col gap-6" aria-label="Customize Home" role="form">
      <p className="text-sm text-muted-foreground">
        Choose what your home shows and in what order. Only you see this arrangement.
      </p>

      {HOME_GROUPS.map((group) => {
        const entries = widgetsOf(draft, group);
        if (entries.length === 0) return null;
        return (
          <section key={group} className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-brown-400">{HOME_GROUP_LABELS[group]}</h2>
            <ul className="flex flex-col divide-y divide-brown-100 rounded-lg border border-brown-100 bg-white">
              {entries.map(({ widget, hidden }, index) => (
                <li key={widget.id} className="flex items-center gap-3 px-4 py-3" data-testid={`customize-${widget.id}`}>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-brown-900">{widget.title}</p>
                    <p className="text-xs text-muted-foreground">{widget.description}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={`Move ${widget.title} Up`}
                    disabled={index === 0 || saving}
                    onClick={() => setDraft((current) => moveWidget(current, widget.id, "up"))}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={`Move ${widget.title} Down`}
                    disabled={index === entries.length - 1 || saving}
                    onClick={() => setDraft((current) => moveWidget(current, widget.id, "down"))}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Switch
                    checked={!hidden}
                    disabled={saving}
                    aria-label={`Show ${widget.title}`}
                    onCheckedChange={(shown) => setDraft((current) => setWidgetHidden(current, widget.id, !shown))}
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {error && <FormError message={error} />}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button type="button" variant="ghost" disabled={saving} onClick={() => void save([])}>
          Reset to Default
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" disabled={saving} onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" disabled={saving} onClick={() => void save(toPlacements(draft, stored))}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
