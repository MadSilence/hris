"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/desact/select";
import { cn } from "@/lib/cn";
import {
  PERFORMANCE_BAND_KEYS,
  PERFORMANCE_BANDS,
  REVIEW_POTENTIAL_KEYS,
  REVIEW_POTENTIALS,
  buildNineBox,
  canDropInto,
  nineBoxKey,
  performanceBand,
  lockedText,
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
  const t = useTranslations("reviews");
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
        <div className="grid grid-cols-[7rem_repeat(3,minmax(0,1fr))] gap-2" role="grid" aria-label={t("calibration.tabs.nineBox")}>
          <div />
          {REVIEW_POTENTIALS.map((p) => (
            <div key={p} className="text-center text-hint font-medium text-tertiary" role="columnheader">
              {t("nineBox.potential", { potential: t(REVIEW_POTENTIAL_KEYS[p]) })}
            </div>
          ))}
          {PERFORMANCE_BANDS.map((band) => (
            <React.Fragment key={band}>
              <div className="flex items-center text-hint font-medium text-tertiary" role="rowheader">
                {t(PERFORMANCE_BAND_KEYS[band])}
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

        <div className="rounded-card border border-dashed border-divider bg-card p-4">
          <h3 className="mb-1 text-body font-medium text-primary">{t("nineBox.unplaced.title")}</h3>
          <p className="mb-3 text-hint text-tertiary">
            {t("nineBox.unplaced.description")}
          </p>
          {box.unplaced.length === 0 ? (
            <p className="text-hint text-tertiary">{t("nineBox.unplaced.none")}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {box.unplaced.map((r) => (
                <PersonCard key={r.participantId} row={r} scale={scale} canEdit={canEdit} onPotentialAction={onPotentialAction}
                  hint={performanceBand(r.finalRating, scale) == null ? t("nineBox.notRated") : null} />
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
  const testId = `box-${band}-${potential}`;
  return (
    <div ref={setNodeRef} role="gridcell" data-test={testId}
      className={cn("min-h-28 space-y-2 rounded-popover border border-divider bg-card p-2",
        allowed && "border-dashed border-accent-ring", allowed && isOver && "bg-accent-subtle")}>
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
  const t = useTranslations("reviews");
  const editable = canEdit && row.editable;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `person:${row.participantId}`,
    data: { row, scale },
    disabled: !editable,
  });
  return (
    <div ref={setNodeRef} data-test="nine-box-card"
      className={cn("w-full min-w-40 rounded-control border border-divider bg-subtle/40 px-2 py-1.5 text-hint",
        editable && "cursor-grab", isDragging && "opacity-50")}
      {...(editable ? listeners : {})} {...(editable ? attributes : {})}>
      <div className="font-medium text-primary">{row.subject.name}</div>
      <div className="text-tertiary">
        {[
          row.finalRating != null ? t("packetLine.rating", { rating: row.finalRating }) : t("nineBox.noRating"),
          row.calibrated ? t("run.person.calibrated") : null,
          hint,
        ].filter(Boolean).join(" · ")}
      </div>
      {editable ? (
        <div className="mt-1" onPointerDown={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          <Select value={row.potential ?? NONE}
            onValueChange={(v) => onPotentialAction(row, v === NONE ? null : (v as ReviewPotential))}>
            <SelectTrigger className="h-7 text-hint" aria-label={t("calibration.potentialOf", { name: row.subject.name })}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>{t("calibration.noPotential")}</SelectItem>
              {REVIEW_POTENTIALS.map((p) => <SelectItem key={p} value={p}>{t(REVIEW_POTENTIAL_KEYS[p])}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      ) : (
        lockedText(t, row, "nineBox.readOnly") && <div className="mt-0.5 text-tertiary">{lockedText(t, row, "nineBox.readOnly")}</div>
      )}
    </div>
  );
}
