import { fireEvent, render, screen } from "@testing-library/react";

import { MoveDocumentForm } from "./MoveDocumentForm";

const folders = [
  {
    id: "folder-1",
    name: "Contracts",
    fileCount: 4,
  },
  {
    id: "folder-2",
    name: "Payslips",
  },
];

/** T06 (DT21): a list of where the files can go — no select with a search inside it. */
describe("MoveDocumentForm", () => {
  it("lists Not in a folder and every folder, the current one picked", () => {
    render(
      <MoveDocumentForm
        folders={folders}
        currentFolderId="folder-1"
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    expect(screen.getByRole("radio", { name: /not in a folder/i })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("radio", { name: /contracts/i })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("4 files")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^move here$/i })).toBeEnabled();
  });

  it("closes without moving when the folder is unchanged", () => {
    const onCancelAction = jest.fn();
    const onSubmitAction = jest.fn();

    render(
      <MoveDocumentForm
        folders={folders}
        currentFolderId="folder-1"
        onCancelAction={onCancelAction}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /^move here$/i }));

    expect(onCancelAction).toHaveBeenCalledTimes(1);
    expect(onSubmitAction).not.toHaveBeenCalled();
  });

  it("calls onCancelAction", () => {
    const onCancelAction = jest.fn();

    render(
      <MoveDocumentForm
        folders={folders}
        currentFolderId="folder-1"
        onCancelAction={onCancelAction}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancelAction).toHaveBeenCalledTimes(1);
  });

  it("submits the picked folder", () => {
    const onSubmitAction = jest.fn();

    render(
      <MoveDocumentForm
        folders={folders}
        currentFolderId="folder-1"
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.click(screen.getByRole("radio", { name: /payslips/i }));
    fireEvent.click(screen.getByRole("button", { name: /^move here$/i }));

    expect(onSubmitAction).toHaveBeenCalledWith({ folderId: "folder-2" });
  });

  it("submits undefined for Not in a folder", () => {
    const onSubmitAction = jest.fn();

    render(
      <MoveDocumentForm
        folders={folders}
        currentFolderId="folder-1"
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.click(screen.getByRole("radio", { name: /not in a folder/i }));
    fireEvent.click(screen.getByRole("button", { name: /^move here$/i }));

    expect(onSubmitAction).toHaveBeenCalledWith({ folderId: undefined });
  });

  it("offers New folder when it may make one", () => {
    const onNewFolderAction = jest.fn();

    render(
      <MoveDocumentForm
        folders={folders}
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
        onNewFolderAction={onNewFolderAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /new folder/i }));
    expect(onNewFolderAction).toHaveBeenCalledTimes(1);
  });
});
