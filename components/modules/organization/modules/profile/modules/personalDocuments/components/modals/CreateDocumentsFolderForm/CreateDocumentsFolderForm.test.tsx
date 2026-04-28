import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { CreateDocumentsFolderForm } from "./CreateDocumentsFolderForm";

describe("CreateDocumentsFolderForm", () => {
  it("renders form content", () => {
    render(
      <CreateDocumentsFolderForm
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    expect(screen.getByLabelText(/folder name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contracts/i)).toBeInTheDocument();
    expect(screen.getByText(/minimum 2 characters/i)).toBeInTheDocument();
  });

  it("submits sanitized folder name", async () => {
    const onSubmitAction = jest.fn();

    render(
      <CreateDocumentsFolderForm
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.change(screen.getByLabelText(/folder name/i), {
      target: { value: "  Contracts  " },
    });

    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledTimes(1);
    });

    expect(onSubmitAction.mock.calls[0][0]).toEqual({
      name: "Contracts",
    });
  });

  it("shows validation error for empty name", async () => {
    const onSubmitAction = jest.fn();

    render(
      <CreateDocumentsFolderForm
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    expect(
      await screen.findByText(/please enter a folder name/i),
    ).toBeInTheDocument();

    expect(onSubmitAction).not.toHaveBeenCalled();
  });

  it("shows validation error for short name", async () => {
    const onSubmitAction = jest.fn();

    render(
      <CreateDocumentsFolderForm
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.change(screen.getByLabelText(/folder name/i), {
      target: { value: "A" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    expect(
      await screen.findByText(/folder name must be at least 2 characters/i),
    ).toBeInTheDocument();

    expect(onSubmitAction).not.toHaveBeenCalled();
  });

  it("calls onDirtyChangeAction", async () => {
    const onDirtyChangeAction = jest.fn();

    render(
      <CreateDocumentsFolderForm
        onCancelAction={jest.fn()}
        onDirtyChangeAction={onDirtyChangeAction}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText(/folder name/i), {
      target: { value: "Contracts" },
    });

    await waitFor(() => {
      expect(onDirtyChangeAction).toHaveBeenLastCalledWith(true);
    });
  });

  it("calls onCancelAction", () => {
    const onCancelAction = jest.fn();

    render(
      <CreateDocumentsFolderForm
        onCancelAction={onCancelAction}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancelAction).toHaveBeenCalledTimes(1);
  });

  it("disables fields while loading", () => {
    render(
      <CreateDocumentsFolderForm
        isLoading
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    expect(screen.getByLabelText(/folder name/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /create/i })).toBeDisabled();
  });
});
