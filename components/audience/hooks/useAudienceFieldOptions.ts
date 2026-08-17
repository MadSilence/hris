"use client";

import type { AudienceValueSource } from "@/components/audience/fieldCatalog";
import type { OptionDTO, ReferenceValueSource } from "@/models/user/fields";
import {
  REFERENCE_ENDPOINTS,
  useReferenceOptions,
} from "@/components/hooks/useReferenceOptions";

export type AudienceOption = { id: string; label: string };

const isReferenceSource = (source: AudienceValueSource): source is ReferenceValueSource =>
  source in REFERENCE_ENDPOINTS || source === "people";

/**
 * Normalises the value options for a picked field's source to { id, label }.
 * - attributeOptions resolve locally (no request);
 * - reference catalogues go through the shared `useReferenceOptions`;
 * - freeText/number/date and `people` have no option list — the picker falls back to an input or,
 *   for people, to a searchable picker rendered by the value editor.
 */
export function useAudienceFieldOptions(
  source: AudienceValueSource,
  attributeOptions?: OptionDTO[] | null,
) {
  const referenceSource = isReferenceSource(source) ? source : undefined;
  const { options: referenceOptions, isLoading, hasEndpoint } =
    useReferenceOptions(referenceSource);

  if (source === "attributeOptions") {
    // Backend matches attr filters on the option's value string, not its id. Enum-like system
    // fields send a separate label because their value is a code (FULL_TIME → "Full-time").
    const options = (attributeOptions ?? []).map((o) => ({ id: o.value, label: o.label ?? o.value }));
    return { options, isLoading: false, hasOptions: true };
  }

  if (!hasEndpoint) {
    return { options: [] as AudienceOption[], isLoading: false, hasOptions: false };
  }

  return { options: referenceOptions, isLoading, hasOptions: true };
}
