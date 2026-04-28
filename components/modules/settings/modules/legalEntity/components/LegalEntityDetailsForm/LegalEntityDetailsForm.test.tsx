import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { LegalEntityDetailsForm } from "./LegalEntityDetailsForm";

const initialValues = {
  name: "Acme LLC",
  description: "",
  registrationNumber: "REG-123",
  taxId: "TAX-123",
  country: "Poland",
  city: "Warsaw",
  street: "",
  building: "",
  postCode: "",
};

describe("LegalEntityDetailsForm", () => {
  it("renders initial values", () => {
    render(
      <LegalEntityDetailsForm
        initialValues={initialValues}
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    expect(screen.getByLabelText(/^name$/i)).toHaveValue("Acme LLC");
    expect(screen.getByLabelText(/registration number/i)).toHaveValue("REG-123");
    expect(screen.getByLabelText(/tax id/i)).toHaveValue("TAX-123");
    expect(screen.getByLabelText(/country/i)).toHaveValue("Poland");
    expect(screen.getByLabelText(/city/i)).toHaveValue("Warsaw");
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
  });

  it("submits sanitized changed values", async () => {
    const onSubmitAction = jest.fn();

    render(
      <LegalEntityDetailsForm
        initialValues={initialValues}
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.change(screen.getByLabelText(/^name$/i), {
      target: { value: "  Acme Updated  " },
    });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledTimes(1);
    });

    expect(onSubmitAction.mock.calls[0][0]).toEqual({
      ...initialValues,
      name: "Acme Updated",
    });
  });

  it("shows validation errors", async () => {
    const onSubmitAction = jest.fn();

    render(
      <LegalEntityDetailsForm
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
      await screen.findByText(/please enter a legal entity name/i),
    ).toBeInTheDocument();

    expect(onSubmitAction).not.toHaveBeenCalled();
  });

  it("calls onDirtyChangeAction", async () => {
    const onDirtyChangeAction = jest.fn();

    render(
      <LegalEntityDetailsForm
        initialValues={initialValues}
        onCancelAction={jest.fn()}
        onDirtyChangeAction={onDirtyChangeAction}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText(/^name$/i), {
      target: { value: "Acme Updated" },
    });

    await waitFor(() => {
      expect(onDirtyChangeAction).toHaveBeenLastCalledWith(true);
    });
  });

  it("calls onCancelAction", () => {
    const onCancelAction = jest.fn();

    render(
      <LegalEntityDetailsForm
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
      <LegalEntityDetailsForm
        isLoading
        initialValues={initialValues}
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    expect(screen.getByLabelText(/^name$/i)).toBeDisabled();
    expect(screen.getByLabelText(/registration number/i)).toBeDisabled();
    expect(screen.getByLabelText(/tax id/i)).toBeDisabled();
    expect(screen.getByLabelText(/country/i)).toBeDisabled();
    expect(screen.getByLabelText(/city/i)).toBeDisabled();

    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
  });
});
