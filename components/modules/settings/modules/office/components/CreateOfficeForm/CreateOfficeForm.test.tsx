import React, { createRef } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { CreateOfficeForm, CreateOfficeFormHandle, CreateOfficeFormValues, } from "./CreateOfficeForm";

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

describe("CreateOfficeForm", () => {
  const baseInitialValues: Partial<CreateOfficeFormValues> = {
    name: "Berlin Office",
    description: "Main DE office",
    email: "berlin@example.com",
    phone: "+49 30 123456",
    country: "Germany",
    city: "Berlin",
    street: "Unter den Linden",
    building: "10",
    postCode: "10117",
  };

  it("renders with initial values", () => {
    const onSubmit = jest.fn();

    render(
      <CreateOfficeForm
        onSubmit={onSubmit}
        initialValues={baseInitialValues}
      />,
    );

    expect(screen.getByLabelText("Name")).toHaveValue("Berlin Office");
    expect(screen.getByLabelText("Description")).toHaveValue("Main DE office");
    expect(screen.getByLabelText("Email")).toHaveValue("berlin@example.com");
    expect(screen.getByLabelText("Phone")).toHaveValue("+49 30 123456");
    expect(screen.getByLabelText("Country")).toHaveValue("Germany");
    expect(screen.getByLabelText("City")).toHaveValue("Berlin");
    expect(screen.getByLabelText("Street")).toHaveValue("Unter den Linden");
    expect(screen.getByLabelText("Building")).toHaveValue("10");
    expect(screen.getByLabelText("Post code")).toHaveValue("10117");
  });

  it("calls onSubmit with form values when formRef.submitForm is called and form is valid", async () => {
    const onSubmit = jest.fn();
    const formRef = createRef<CreateOfficeFormHandle | undefined>();

    render(
      <CreateOfficeForm
        formRef={formRef}
        onSubmit={onSubmit}
        initialValues={baseInitialValues}
      />,
    );

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Berlin HQ" },
    });

    await act(async () => {
      await formRef.current!.submitForm();
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Berlin HQ",
      description: "Main DE office",
      email: "berlin@example.com",
      phone: "+49 30 123456",
      country: "Germany",
      city: "Berlin",
      street: "Unter den Linden",
      building: "10",
      postCode: "10117",
    });
  });

  it("does not call onSubmit and shows validation error when required field is empty", async () => {
    const onSubmit = jest.fn();
    const formRef = createRef<CreateOfficeFormHandle | undefined>();

    render(
      <CreateOfficeForm
        formRef={formRef}
        onSubmit={onSubmit}
        initialValues={{ ...baseInitialValues, name: "" }}
      />,
    );

    await act(async () => {
      await formRef.current!.submitForm();
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText("Please enter an office name."),
    ).toBeInTheDocument();
  });
});
