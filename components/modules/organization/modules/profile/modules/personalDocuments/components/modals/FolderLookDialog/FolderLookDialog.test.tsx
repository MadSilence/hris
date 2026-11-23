import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { Briefcase01Icon, Folder01Icon, IdCardIcon } from "@hugeicons/core-free-icons";
import { ActionStatus } from "@/components/models/ActionStatus";
import type { DocumentFolderDTO } from "@/api/modules/documents/dto";
import { updateFolderLookAction } from "../../../actions/documentsFolder/updateFolderLookAction";
import { folderIcon } from "../../PersonalDocumentsFolderCard/PersonalDocumentsFolderCard";
import { FolderLookDialog } from "./FolderLookDialog";

jest.mock("../../../actions/documentsFolder/updateFolderLookAction", () => ({ updateFolderLookAction: jest.fn() }));

const update = updateFolderLookAction as jest.MockedFunction<typeof updateFolderLookAction>;

const folder = (icon: string | null): DocumentFolderDTO => ({
  id: "f1",
  name: "Contracts",
  parentId: null,
  userId: "u1",
  createdAt: "2026-11-01T00:00:00Z",
  icon,
  color: "berry",
});

// R15 (2026-11-23), the designers' DT6 and DT20: sixteen icons and eight colour dots.
describe("FolderLookDialog", () => {
  it("offers eight colour dots and sixteen icons, the folder's own ones picked", () => {
    render(<FolderLookDialog userId="u1" folder={folder("id-card")} onCloseAction={jest.fn()} onSavedAction={jest.fn()} />);

    const colors = within(screen.getByRole("radiogroup", { name: "Color" })).getAllByRole("radio");
    expect(colors).toHaveLength(8);
    expect(screen.getByRole("radio", { name: "Berry" })).toHaveAttribute("aria-checked", "true");
    // A dot carries no visible word: the colour's name is for a screen reader only.
    expect(colors.every((dot) => dot.textContent === "")).toBe(true);

    const icons = within(screen.getByRole("radiogroup", { name: "Icon" })).getAllByRole("radio");
    expect(icons).toHaveLength(16);
    expect(screen.getByRole("radio", { name: "ID card" })).toHaveAttribute("aria-checked", "true");
  });

  it("keeps an icon offered before R15 when only the colour changes", async () => {
    update.mockResolvedValue({ status: ActionStatus.SUCCESS });
    render(<FolderLookDialog userId="u1" folder={folder("briefcase")} onCloseAction={jest.fn()} onSavedAction={jest.fn()} />);

    fireEvent.click(screen.getByRole("radio", { name: "Ocean" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith({ userId: "u1", folderId: "f1", icon: "briefcase", color: "ocean" }),
    );
  });
});

describe("folderIcon", () => {
  it("draws the new set, the old keys as they were, and the folder for anything else", () => {
    expect(folderIcon("id-card")).toBe(IdCardIcon);
    expect(folderIcon("briefcase")).toBe(Briefcase01Icon);
    expect(folderIcon("nonsense")).toBe(Folder01Icon);
    expect(folderIcon(null)).toBe(Folder01Icon);
  });
});
