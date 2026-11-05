"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { AriaLabelConfig } from "@xyflow/react";

/**
 * React Flow's own words — the zoom buttons, the keyboard hints, the live region — in the reader's language.
 * The library ships English defaults ("Zoom In", "Fit View") and takes the replacements through
 * `ariaLabelConfig`; every canvas passes this. Found on the i18n walk of 2026-11-05.
 */
export const useFlowAriaLabels = (): Partial<AriaLabelConfig> => {
  const t = useTranslations("common");
  return useMemo(
    () => ({
      "node.a11yDescription.default": t("flow.nodeDescription"),
      "node.a11yDescription.keyboardDisabled": t("flow.nodeDescriptionKeyboard"),
      "node.a11yDescription.ariaLiveMessage": ({ direction, x, y }: { direction: string; x: number; y: number }) =>
        t("flow.nodeMoved", { direction, x: Math.round(x), y: Math.round(y) }),
      "edge.a11yDescription.default": t("flow.edgeDescription"),
      "controls.ariaLabel": t("flow.controls"),
      "controls.zoomIn.ariaLabel": t("flow.zoomIn"),
      "controls.zoomOut.ariaLabel": t("flow.zoomOut"),
      "controls.fitView.ariaLabel": t("flow.fitView"),
      "controls.interactive.ariaLabel": t("flow.interactive"),
      "minimap.ariaLabel": t("flow.minimap"),
      "handle.ariaLabel": t("flow.handle"),
    }),
    [t],
  );
};
