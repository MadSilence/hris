import { fireEvent, render, screen } from "@testing-library/react";
import { partialMock } from "@/test/types";
import type { DocumentDTO } from "@/api/modules/documents/dto";
import { PersonalDocumentsFilesTable } from "./PersonalDocumentsFilesTable";

jest.mock("@/components/ui/RowActionsMenu", () => ({
  RowActionsMenu: () => null,
  RowAction: () => null,
  RowActionDestructive: () => null,
}));

const doc = (id: string, name: string, isStarred: boolean) =>
  partialMock<DocumentDTO>({ id, name, isStarred, sizeBytes: 193, createdAt: "2026-10-30T12:00:00", mimeType: "application/octet-stream" });

/** The star was an unlabelled icon button: a screen reader announced "button" and nothing else (walk of 2026-10-30). */
describe("PersonalDocumentsFilesTable — the star", () => {
  it("says what it does and whether it is on", () => {
    const onToggleStar = jest.fn();
    render(
      <PersonalDocumentsFilesTable
        documents={[doc("a", "walk-note.pdf", true), doc("b", "other.pdf", false)]}
        sort={{ field: "name", dir: "asc" }}
        onSortChange={jest.fn()}
        onToggleStar={onToggleStar}
        getDownloadUrl={(id) => `/d/${id}`}
      />,
    );

    expect(screen.getByRole("button", { name: "Unstar" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Star" }));
    expect(onToggleStar).toHaveBeenCalledWith(expect.objectContaining({ id: "b" }));
  });
});
