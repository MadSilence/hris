/**
 * What deleting a folder would touch, as the server counts it at the moment of asking.
 *
 * Two pairs, because the two strategies touch different things. `MOVE_TO_PARENT` lifts the immediate
 * children and nothing else, so the direct counts describe it. `TRASH_CONTENTS` takes the whole
 * subtree — the dialog used to show the direct counts for both, so on a four-level tree it said
 * "1 document and 1 folder" while the delete correctly trashed four and three.
 */
export interface DocumentFolderDeleteImpactDTO {
  name: string;
  /** Directly inside — what `MOVE_TO_PARENT` lifts. */
  documents: number;
  subfolders: number;
  /** Anywhere beneath, at any depth — what `TRASH_CONTENTS` takes. Includes the direct ones. */
  documentsInSubtree: number;
  subfoldersInSubtree: number;
}

/**
 * What happens to the contents. `MOVE_TO_PARENT` lifts them a level and keeps them; `TRASH_CONTENTS`
 * sends them to the trash with the folder — to the trash, never erased, because a document is
 * content and content is deleted softly.
 */
export type DocumentFolderDeleteStrategy = "MOVE_TO_PARENT" | "TRASH_CONTENTS";
