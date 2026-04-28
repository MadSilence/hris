import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ExportAssignedUsersForm } from "./ExportAssignedUsersForm";

describe("ExportAssignedUsersForm", () => {
  it("renders form content", () => {
    render(
      <ExportAssignedUsersForm
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    expect(screen.getByText(/format/i)).toBeInTheDocument();
    expect(screen.getByText(/csv/i)).toBeInTheDocument();
    expect(screen.getByText(/xlsx/i)).toBeInTheDocument();
    expect(screen.getByText(/lightweight/i)).toBeInTheDocument();
    expect(screen.getByText(/recommended/i)).toBeInTheDocument();
    expect(
      screen.getByText(/included: user name, email, position/i),
    ).toBeInTheDocument();
  });

  it("submits xlsx by default", async () => {
    const onSubmitAction = jest.fn();

    render(
      <ExportAssignedUsersForm
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /export/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledTimes(1);
    });

    expect(onSubmitAction.mock.calls[0][0]).toEqual({
      format: "xlsx",
    });
  });

  it("submits selected csv format", async () => {
    const onSubmitAction = jest.fn();

    render(
      <ExportAssignedUsersForm
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /csv/i }));
    fireEvent.click(screen.getByRole("button", { name: /export/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledTimes(1);
    });

    expect(onSubmitAction.mock.calls[0][0]).toEqual({
      format: "csv",
    });
  });

  it("calls onCancelAction", () => {
    const onCancelAction = jest.fn();

    render(
      <ExportAssignedUsersForm
        onCancelAction={onCancelAction}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancelAction).toHaveBeenCalledTimes(1);
  });

  it("disables actions while loading", () => {
    render(
      <ExportAssignedUsersForm
        isLoading
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /csv/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /xlsx/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /export/i })).toBeDisabled();
  });
});
