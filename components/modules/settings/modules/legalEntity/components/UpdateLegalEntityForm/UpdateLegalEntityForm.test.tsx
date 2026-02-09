import React, { createRef } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { UpdateLegalEntityForm, UpdateLegalEntityFormHandle, UpdateLegalEntityFormValues, } from "./UpdateLegalEntityForm";

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

describe("UpdateLegalEntityForm", () => {
  const initialValues: UpdateLegalEntityFormValues = {
    name: "ACME GmbH",
    description: "Existing description",
    registrationNumber: "HRB 654321",
    taxId: "DE987654321",
    country: "Germany",
    city: "Berlin",
    street: "Alexanderplatz",
    building: "1",
    postCode: "10178",
  };

  it("renders with initial values", () => {
    const onSubmit = jest.fn();

    render(
      <UpdateLegalEntityForm
        onSubmit={onSubmit}
        initialValues={initialValues}
      />
    );

    expect(screen.getByLabelText("Name")).toHaveValue("ACME GmbH");
    expect(screen.getByLabelText("Description")).toHaveValue(
      "Existing description"
    );
    expect(screen.getByLabelText("Registration number")).toHaveValue(
      "HRB 654321"
    );
    expect(screen.getByLabelText("Tax ID")).toHaveValue("DE987654321");
    expect(screen.getByLabelText("Country")).toHaveValue("Germany");
    expect(screen.getByLabelText("City")).toHaveValue("Berlin");
    expect(screen.getByLabelText("Street")).toHaveValue("Alexanderplatz");
    expect(screen.getByLabelText("Building")).toHaveValue("1");
    expect(screen.getByLabelText("Post code")).toHaveValue("10178");
  });

  it("calls onSubmit with updated values when formRef.submitForm is called and form is valid", async () => {
    const onSubmit = jest.fn();
    const formRef = createRef<UpdateLegalEntityFormHandle>();

    render(
      <UpdateLegalEntityForm
        formRef={formRef}
        onSubmit={onSubmit}
        initialValues={initialValues}
      />
    );

    fireEvent.change(screen.getByLabelText("City"), {
      target: { value: "Munich" },
    });

    await act(async () => {
      await formRef.current!.submitForm();
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      ...initialValues,
      city: "Munich",
    });
  });

  it("does not call onSubmit and shows validation error when required field is empty", async () => {
    const onSubmit = jest.fn();
    const formRef = createRef<UpdateLegalEntityFormHandle>();

    render(
      <UpdateLegalEntityForm
        formRef={formRef}
        onSubmit={onSubmit}
        initialValues={{ ...initialValues, name: "" }}
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
