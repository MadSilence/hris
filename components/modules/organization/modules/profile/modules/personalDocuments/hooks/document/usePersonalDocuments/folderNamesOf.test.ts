import type { DocumentFolderDTO } from "@/api/modules/documents/dto";
import { partialMock } from "@/test/types";
import { folderNamesOf } from "./usePersonalDocuments";

/** All documents heads a nested folder's files with that folder's name, not a bare id (DESIGN_LEFTOVERS batch 5). */
describe("folderNamesOf", () => {
  it("names the root's folders and the deeper ones the listing carries", () => {
    const names = folderNamesOf({
      folders: [partialMock<DocumentFolderDTO>({ id: "root-1", name: "Contracts" })],
      folderNames: { "nested-1": "2026", "root-1": "Contracts" },
    });
    expect(names.get("root-1")).toBe("Contracts");
    expect(names.get("nested-1")).toBe("2026");
  });

  it("is empty before anything has loaded", () => {
    expect(folderNamesOf(undefined).size).toBe(0);
  });
});
