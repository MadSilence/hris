import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { OfficeDetailsForm } from "./OfficeDetailsForm";

const initialValues = {
  name: "Warsaw Office",
  description: "",
  email: "warsaw@example.com",
  phone: "",
  country: "Poland",
  city: "Warsaw",
  street: "",
  building: "",
  postCode: "",
};

describe("OfficeDetailsForm", () => {
  it("renders initial values", () => {
    render(
      <OfficeDetailsForm
        initialValues={initialValues}
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    expect(screen.getByLabelText(/^name$/i)).toHaveValue("Warsaw Office");
    expect(screen.getByLabelText(/email/i)).toHaveValue("warsaw@example.com");
    expect(screen.getByLabelText(/country/i)).toHaveValue("Poland");
    expect(screen.getByLabelText(/city/i)).toHaveValue("Warsaw");
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
  });

  it("submits sanitized changed values", async () => {
    const onSubmitAction = jest.fn();

    render(
      <OfficeDetailsForm
        initialValues={initialValues}
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.change(screen.getByLabelText(/^name$/i), {
      target: { value: "  Warsaw Office Updated  " },
    });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledTimes(1);
    });

    expect(onSubmitAction.mock.calls[0][0]).toEqual({
      ...initialValues,
      name: "Warsaw Office Updated",
    });
  });

  it("shows validation errors", async () => {
    const onSubmitAction = jest.fn();

    render(
      <OfficeDetailsForm
        initialValues={initialValues}
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.change(screen.getByLabelText(/^name$/i), {
      target: { value: "" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(
      await screen.findByText(/please enter an office name/i),
    ).toBeInTheDocument();

    expect(onSubmitAction).not.toHaveBeenCalled();
  });

  it("shows validation error for invalid email", async () => {
    const onSubmitAction = jest.fn();

    render(
      <OfficeDetailsForm
        initialValues={initialValues}
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "invalid-email" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(
      await screen.findByText(/please enter a valid email/i),
    ).toBeInTheDocument();

    expect(onSubmitAction).not.toHaveBeenCalled();
  });

  it("calls onDirtyChangeAction", async () => {
    const onDirtyChangeAction = jest.fn();

    render(
      <OfficeDetailsForm
        initialValues={initialValues}
        onCancelAction={jest.fn()}
        onDirtyChangeAction={onDirtyChangeAction}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText(/^name$/i), {
      target: { value: "Warsaw Office Updated" },
    });

    await waitFor(() => {
      expect(onDirtyChangeAction).toHaveBeenLastCalledWith(true);
    });
  });

  it("calls onCancelAction", () => {
    const onCancelAction = jest.fn();

    render(
      <OfficeDetailsForm
        initialValues={initialValues}
        onCancelAction={onCancelAction}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancelAction).toHaveBeenCalledTimes(1);
  });

  it("disables fields while loading", () => {
    render(
      <OfficeDetailsForm
        isLoading
        initialValues={initialValues}
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    expect(screen.getByLabelText(/^name$/i)).toBeDisabled();
    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/country/i)).toBeDisabled();
    expect(screen.getByLabelText(/city/i)).toBeDisabled();

    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
  });
});
