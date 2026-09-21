"use client";

import type { AudienceValueSource } from "@/components/audience/fieldCatalog";
import type { OptionDTO, ReferenceValueSource } from "@/models/user/fields";
import type { AttributeType } from "@/models/attribute/AttributeType";
import { getCatalogOptions } from "@/models/attribute/managedCatalogs";
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
 * - a managed catalogue (country, language, time zone, currency) resolves locally too, from the same
 *   list the profile edits with — so a filter offers exactly the values a profile can hold;
 * - reference catalogues go through the shared `useReferenceOptions`;
 * - freeText/number/date and `people` have no option list — the picker falls back to an input or,
 *   for people, to a searchable picker rendered by the value editor.
 */
export function useAudienceFieldOptions(
  source: AudienceValueSource,
  attributeOptions?: OptionDTO[] | null,
  attributeType?: AttributeType | null,
) {
  const referenceSource = isReferenceSource(source) ? source : undefined;
  const { options: referenceOptions, isLoading, hasEndpoint } =
    useReferenceOptions(referenceSource);

  if (source === "attributeOptions") {
    // `id` is what a filter is stored and matched by — `opt:<uuid>` for a custom attribute's option,
    // the stored code for an enum-like system field (FULL_TIME), which is why both can go through
    // one branch. The label is display only, and deliberately not what is sent: an option's text is
    // editable, and a filter that matched on it silently stopped matching after a rename — in a
    // CUSTOM access scope, that is people quietly disappearing from somebody's view.
    const options = (attributeOptions ?? []).map((o) => ({ id: o.id, label: o.label ?? o.value }));
    return { options, isLoading: false, hasOptions: true };
  }

  if (source === "catalog") {
    // The stored text is the id: a country is kept by its name, a currency by its code, and the
    // filter compares the stored text.
    const options = attributeType
      ? getCatalogOptions(attributeType).map((o) => ({ id: o.value, label: o.label }))
      : [];
    return { options, isLoading: false, hasOptions: true };
  }

  if (!hasEndpoint) {
    return { options: [] as AudienceOption[], isLoading: false, hasOptions: false };
  }

  return { options: referenceOptions, isLoading, hasOptions: true };
}
