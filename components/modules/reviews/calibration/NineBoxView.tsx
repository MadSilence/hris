"use client";

import React, { useMemo } from "react";
import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/public/desact/src/components/ui/select";
import { cn } from "@/public/desact/src/components/ui/utils";
import {
  PERFORMANCE_BAND_LABELS,
  PERFORMANCE_BANDS,
  REVIEW_POTENTIAL_LABELS,
  REVIEW_POTENTIALS,
  buildNineBox,
  canDropInto,
  nineBoxKey,
  performanceBand,
  type CalibrationRow,
  type PerformanceBand,
  type ReviewPotential,
  type ScalePoint,
} from "@/models/reviews";

const NONE = "NONE";

type Props = {
  rows: CalibrationRow[];
  scale: ScalePoint[];
  canEdit: boolean;
  onPotentialAction: (row: CalibrationRow, potential: ReviewPotential | null) => void;
};

/**
 * The 9-box (REVIEWS_PLAN.md 12.2): performance — the final rating in thirds of the scale — by potential. Dragging a
 * card along its own row changes the person's potential and nothing else (A9); the rating changes in the table, where
 * a reason is asked. The select on every card does the same without a mouse.
 */
export function NineBoxView({ rows, scale, canEdit, onPotentialAction }: Props) {
  const box = useMemo(() => buildNineBox(rows, scale), [rows, scale]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const onDragEnd = (event: DragEndEvent) => {
    const row = event.active.data.current?.row as CalibrationRow | undefined;
    const target = event.over?.data.current as { band: PerformanceBand; potential: ReviewPotential } | undefined;
    if (!row || !target || row.potential === target.potential) return;
    if (!canDropInto(row, target.band, scale)) return;
    onPotentialAction(row, target.potential);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="space-y-4">
        <div className="grid grid-cols-[7rem_repeat(3,minmax(0,1fr))] gap-2" role="grid" aria-label="9-Box">
          <div />
          {REVIEW_POTENTIALS.map((p) => (
            <div key={p} className="text-center text-xs font-medium text-muted-foreground" role="columnheader">
              {REVIEW_POTENTIAL_LABELS[p]} Potential
            </div>
          ))}
          {PERFORMANCE_BANDS.map((band) => (
            <React.Fragment key={band}>
              <div className="flex items-center text-xs font-medium text-muted-foreground" role="rowheader">
                {PERFORMANCE_BAND_LABELS[band]}
              </div>
              {REVIEW_POTENTIALS.map((potential) => (
                <Box key={potential} band={band} potential={potential}>
                  {(box.cells.get(nineBoxKey(band, potential)) ?? []).map((r) => (
                    <PersonCard key={r.participantId} row={r} scale={scale} canEdit={canEdit} onPotentialAction={onPotentialAction} />
                  ))}
                </Box>
              ))}
            </React.Fragment>
          ))}
        </div>

        <div className="rounded-xl border border-dashed border-brown-200 bg-white p-4">
          <h3 className="mb-1 text-sm font-medium text-brown-900">Unplaced</h3>
          <p className="mb-3 text-xs text-muted-foreground">
            People with no potential yet, or no rating to place them by. Set a potential on a card, or drag it into a box of
            its own performance row.
          </p>
          {box.unplaced.length === 0 ? (
            <p className="text-xs text-muted-foreground">Everybody is placed.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {box.unplaced.map((r) => (
                <PersonCard key={r.participantId} row={r} scale={scale} canEdit={canEdit} onPotentialAction={onPotentialAction}
                  hint={performanceBand(r.finalRating, scale) == null ? "Not rated yet" : null} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DndContext>
  );
}

function Box({ band, potential, children }: { band: PerformanceBand; potential: ReviewPotential; children: React.ReactNode }) {
  const { setNodeRef, isOver, active } = useDroppable({ id: nineBoxKey(band, potential), data: { band, potential } });
  const dragged = active?.data.current?.row as CalibrationRow | undefined;
  const scale = active?.data.current?.scale as ScalePoint[] | undefined;
  // Only the boxes of the dragged person's own row light up: the rest refuse the drop (A9).
  const allowed = dragged != null && scale != null && canDropInto(dragged, band, scale);
  return (
    <div ref={setNodeRef} role="gridcell" data-test={`box-${band}-${potential}`}
      className={cn("min-h-28 space-y-2 rounded-xl border border-brown-100 bg-white p-2",
        allowed && "border-success-300", allowed && isOver && "bg-success-50")}>
      {children}
    </div>
  );
}

function PersonCard({ row, scale, canEdit, onPotentialAction, hint }: {
  row: CalibrationRow;
  scale: ScalePoint[];
  canEdit: boolean;
  onPotentialAction: (row: CalibrationRow, potential: ReviewPotential | null) => void;
  hint?: string | null;
}) {
  const editable = canEdit && row.editable;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `person:${row.participantId}`,
    data: { row, scale },
    disabled: !editable,
  });
  return (
    <div ref={setNodeRef} data-test="nine-box-card"
      className={cn("w-full min-w-40 rounded-lg border border-brown-100 bg-brown-50/40 px-2 py-1.5 text-xs",
        editable && "cursor-grab", isDragging && "opacity-50")}
      {...(editable ? listeners : {})} {...(editable ? attributes : {})}>
      <div className="font-medium text-brown-900">{row.subject.name}</div>
      <div className="text-muted-foreground">
        {row.finalRating != null ? `Rating ${row.finalRating}` : "No rating"}
        {row.calibrated ? " · calibrated" : ""}
        {hint ? ` · ${hint}` : ""}
      </div>
      {editable ? (
        <div className="mt-1" onPointerDown={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          <Select value={row.potential ?? NONE}
            onValueChange={(v) => onPotentialAction(row, v === NONE ? null : (v as ReviewPotential))}>
            <SelectTrigger className="h-7 text-xs" aria-label={`Potential of ${row.subject.name}`}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>No Potential</SelectItem>
              {REVIEW_POTENTIALS.map((p) => <SelectItem key={p} value={p}>{REVIEW_POTENTIAL_LABELS[p]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      ) : (
        row.lockedReason && <div className="mt-0.5 text-muted-foreground">Read-only: {row.lockedReason}</div>
      )}
    </div>
  );
}
