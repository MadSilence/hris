import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { RenameDocumentsFolderForm } from "./RenameDocumentsFolderForm";

describe("RenameDocumentsFolderForm", () => {
  it("renders form content with initial folder name", () => {
    render(
      <RenameDocumentsFolderForm
        folderName="Contracts"
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    expect(screen.getByLabelText(/folder name/i)).toHaveValue("Contracts");
    expect(screen.getByRole("button", { name: /save/i })).toBeEnabled();
  });

  it("submits sanitized changed name", async () => {
    const onSubmitAction = jest.fn();

    render(
      <RenameDocumentsFolderForm
        folderName="Contracts"
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.change(screen.getByLabelText(/folder name/i), {
      target: { value: "  Contracts Updated  " },
    });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledTimes(1);
    });

    expect(onSubmitAction.mock.calls[0][0]).toEqual({
      name: "Contracts Updated",
    });
  });

  it("does not submit unchanged name, and closes", async () => {
    const onSubmitAction = jest.fn();
    const onCancelAction = jest.fn();

    render(
      <RenameDocumentsFolderForm
        folderName="Contracts"
        onCancelAction={onCancelAction}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(onCancelAction).toHaveBeenCalledTimes(1));
    expect(onSubmitAction).not.toHaveBeenCalled();
  });

  it("does not submit short name, and says why under the field", async () => {
    const onSubmitAction = jest.fn();

    render(
      <RenameDocumentsFolderForm
        folderName="Contracts"
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.change(screen.getByLabelText(/folder name/i), {
      target: { value: "A" },
    });

    expect(screen.getByRole("button", { name: /save/i })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(await screen.findByText("Folder name must be at least 2 characters.")).toBeInTheDocument();
    expect(onSubmitAction).not.toHaveBeenCalled();
  });

  it("calls onCancelAction", () => {
    const onCancelAction = jest.fn();

    render(
      <RenameDocumentsFolderForm
        folderName="Contracts"
        onCancelAction={onCancelAction}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancelAction).toHaveBeenCalledTimes(1);
  });

  it("disables fields while loading", () => {
    render(
      <RenameDocumentsFolderForm
        isLoading
        folderName="Contracts"
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    expect(screen.getByLabelText(/folder name/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
  });
});
