/** What deleting a folder would touch, as the server counts it at the moment of asking. */
export interface DocumentFolderDeleteImpactDTO {
  name: string;
  documents: number;
  subfolders: number;
}

/**
 * What happens to the contents. `MOVE_TO_PARENT` lifts them a level and keeps them; `TRASH_CONTENTS`
 * sends them to the trash with the folder — to the trash, never erased, because a document is
 * content and content is deleted softly.
 */
export type DocumentFolderDeleteStrategy = "MOVE_TO_PARENT" | "TRASH_CONTENTS";
