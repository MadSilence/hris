/**
 * PATCH /attributes/{id} — the id plus the version the update left the attribute at.
 *
 * The edit form saves the attribute and then its option set, and both are guarded on the
 * attribute's version. The first write moves it, so the second has to carry the new number.
 */
export type AttributeUpdateResponse = {
  id: string;
  version?: number;
};
