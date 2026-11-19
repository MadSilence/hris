import type { WelcomeDTO } from "@/api/modules/firstRun/dto";
import type { Attribute } from "@/models/attribute/Attribute";

/** The welcome's fields are keyed `attr:<attribute id>`, the profile's own attribute ids without it. */
export const ATTR_PREFIX = "attr:";

/** No answer yet: nothing stored, an empty string, or an empty list. */
export const isBlankValue = (value: unknown): boolean =>
  value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0);

/**
 * The person's own fields they may edit about themselves (the backend's `WelcomeService` decides which), as the
 * attributes the profile renders them from — in My profile's order, the groups' and then each group's own. The
 * catalogue comes from `/groups`, which every employee may read, so a field looks and validates as it does there.
 */
export const ownEditableAttributes = (
  welcome: Pick<WelcomeDTO, "fields"> | undefined,
  groups: { attributes: Attribute[] }[] | undefined,
): Attribute[] => {
  const wanted = new Set(
    (welcome?.fields ?? [])
      .map((f) => f.id)
      .filter((id) => Boolean(id) && id.startsWith(ATTR_PREFIX))
      .map((id) => id.slice(ATTR_PREFIX.length)),
  );
  if (!wanted.size) return [];
  return (groups ?? []).flatMap((group) => group.attributes).filter((attribute) => wanted.has(attribute.id));
};

