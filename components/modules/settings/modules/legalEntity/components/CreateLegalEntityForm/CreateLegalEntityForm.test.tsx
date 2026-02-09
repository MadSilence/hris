import React, { createRef } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { CreateLegalEntityForm, CreateLegalEntityFormHandle, CreateLegalEntityFormValues, } from "./CreateLegalEntityForm";

jest.mock("@/components/ui/Input/Input", () => ({
  __esModule: true,
  default: ({ label, error, value, onChange, ...rest }: any) => (
    <div>
      <label>
        {label}
        <input
          aria-label={label}
          value={value}
          onChange={onChange}
          {...rest}
        />
      </label>
      {error && <span data-testid={`${label}-error`}>{error}</span>}
    </div>
  ),
}));

describe("CreateLegalEntityForm", () => {
  const baseInitialValues: Partial<CreateLegalEntityFormValues> = {
    name: "ACME GmbH",
    description: "Test description",
    registrationNumber: "HRB 123456",
    taxId: "DE123456789",
    country: "Germany",
    city: "Berlin",
    street: "Unter den Linden",
    building: "10",
    postCode: "10117",
  };

  it("renders with initial values", () => {
    const onSubmit = jest.fn();

    render(
      <CreateLegalEntityForm
        onSubmit={onSubmit}
        initialValues={baseInitialValues}
      />
    );

    expect(screen.getByLabelText("Name")).toHaveValue("ACME GmbH");
    expect(screen.getByLabelText("Description")).toHaveValue(
      "Test description"
    );
    expect(screen.getByLabelText("Registration number")).toHaveValue(
      "HRB 123456"
    );
    expect(screen.getByLabelText("Tax ID")).toHaveValue("DE123456789");
    expect(screen.getByLabelText("Country")).toHaveValue("Germany");
    expect(screen.getByLabelText("City")).toHaveValue("Berlin");
    expect(screen.getByLabelText("Street")).toHaveValue("Unter den Linden");
    expect(screen.getByLabelText("Building")).toHaveValue("10");
    expect(screen.getByLabelText("Post code")).toHaveValue("10117");
  });

  it("calls onSubmit with form values when formRef.submitForm is called and form is valid", async () => {
    const onSubmit = jest.fn();
    const formRef = createRef<CreateLegalEntityFormHandle>();

    render(
      <CreateLegalEntityForm
        formRef={formRef}
        onSubmit={onSubmit}
        initialValues={baseInitialValues}
      />
    );

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "ACME Updated" },
    });

    await act(async () => {
      await formRef.current!.submitForm();
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      name: "ACME Updated",
      description: "Test description",
      registrationNumber: "HRB 123456",
      taxId: "DE123456789",
      country: "Germany",
      city: "Berlin",
      street: "Unter den Linden",
      building: "10",
      postCode: "10117",
    });
  });

  it("does not call onSubmit and shows validation error when required field is empty", async () => {
    const onSubmit = jest.fn();
    const formRef = createRef<CreateLegalEntityFormHandle>();

    render(
      <CreateLegalEntityForm
        formRef={formRef}
        onSubmit={onSubmit}
        initialValues={{ ...baseInitialValues, name: "" }}
      />
    );

    await act(async () => {
      await formRef.current!.submitForm();
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText("Please enter a legal entity name.")
    ).toBeInTheDocument();
  });
});
