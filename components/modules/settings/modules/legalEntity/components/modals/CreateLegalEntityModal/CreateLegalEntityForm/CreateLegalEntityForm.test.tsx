import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { CreateLegalEntityForm } from "./CreateLegalEntityForm";

const validValues = {
  name: "  Acme LLC  ",
  description: "  Main company  ",
  registrationNumber: "  REG-123  ",
  taxId: "  TAX-123  ",
  country: "  Poland  ",
  city: "  Warsaw  ",
  street: "  Main Street  ",
  building: "  1A  ",
  postCode: "  00-001  ",
};

function fillValidForm() {
  fireEvent.change(screen.getByLabelText(/^name$/i), {
    target: { value: validValues.name },
  });

  fireEvent.change(screen.getByLabelText(/description/i), {
    target: { value: validValues.description },
  });

  fireEvent.change(screen.getByLabelText(/registration number/i), {
    target: { value: validValues.registrationNumber },
  });

  fireEvent.change(screen.getByLabelText(/tax id/i), {
    target: { value: validValues.taxId },
  });

  fireEvent.change(screen.getByLabelText(/country/i), {
    target: { value: validValues.country },
  });

  fireEvent.change(screen.getByLabelText(/city/i), {
    target: { value: validValues.city },
  });

  fireEvent.change(screen.getByLabelText(/street/i), {
    target: { value: validValues.street },
  });

  fireEvent.change(screen.getByLabelText(/building/i), {
    target: { value: validValues.building },
  });

  fireEvent.change(screen.getByLabelText(/post code/i), {
    target: { value: validValues.postCode },
  });
}

describe("CreateLegalEntityForm", () => {
  it("renders form content", () => {
    render(
      <CreateLegalEntityForm
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    expect(screen.getByText(/legal entity details/i)).toBeInTheDocument();
    expect(screen.getByText(/address/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/registration number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tax id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
  });

  it("renders initial values", () => {
    render(
      <CreateLegalEntityForm
        initialValues={{
          name: "Initial LLC",
          registrationNumber: "REG",
          taxId: "TAX",
          country: "Poland",
          city: "Warsaw",
        }}
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    expect(screen.getByLabelText(/^name$/i)).toHaveValue("Initial LLC");
    expect(screen.getByLabelText(/registration number/i)).toHaveValue("REG");
    expect(screen.getByLabelText(/tax id/i)).toHaveValue("TAX");
    expect(screen.getByLabelText(/country/i)).toHaveValue("Poland");
    expect(screen.getByLabelText(/city/i)).toHaveValue("Warsaw");
  });

  it("submits sanitized values", async () => {
    const onSubmitAction = jest.fn();

    render(
      <CreateLegalEntityForm
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fillValidForm();

    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledTimes(1);
    });

    expect(onSubmitAction.mock.calls[0][0]).toEqual({
      name: "Acme LLC",
      description: "Main company",
      registrationNumber: "REG-123",
      taxId: "TAX-123",
      country: "Poland",
      city: "Warsaw",
      street: "Main Street",
      building: "1A",
      postCode: "00-001",
    });
  });

  it("shows validation errors for required fields", async () => {
    const onSubmitAction = jest.fn();

    render(
      <CreateLegalEntityForm
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    expect(
      await screen.findByText(/please enter a legal entity name/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/please enter a registration number/i),
    ).toBeInTheDocument();

    expect(screen.getByText(/please enter a tax id/i)).toBeInTheDocument();
    expect(screen.getByText(/please enter a country/i)).toBeInTheDocument();
    expect(screen.getByText(/please enter a city/i)).toBeInTheDocument();

    expect(onSubmitAction).not.toHaveBeenCalled();
  });

  it("calls onDirtyChangeAction", async () => {
    const onDirtyChangeAction = jest.fn();

    render(
      <CreateLegalEntityForm
        onCancelAction={jest.fn()}
        onDirtyChangeAction={onDirtyChangeAction}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText(/^name$/i), {
      target: { value: "Acme LLC" },
    });

    await waitFor(() => {
      expect(onDirtyChangeAction).toHaveBeenLastCalledWith(true);
    });
  });

  it("calls onCancelAction", () => {
    const onCancelAction = jest.fn();

    render(
      <CreateLegalEntityForm
        onCancelAction={onCancelAction}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancelAction).toHaveBeenCalledTimes(1);
  });

  it("disables fields while loading", () => {
    render(
      <CreateLegalEntityForm
        isLoading
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
    expect(screen.getByRole("button", { name: /create/i })).toBeDisabled();
  });
});
