export type RenameAttributeGroupRequest = {
  id: string;
  name: string;
  description?: string | null;
  /** The group's version the form was opened with; a stale one is refused with E00409. */
  version?: number;
};
