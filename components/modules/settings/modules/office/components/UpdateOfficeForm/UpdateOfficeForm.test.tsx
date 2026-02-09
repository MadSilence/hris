import React, { createRef } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { UpdateOfficeForm, UpdateOfficeFormHandle, UpdateOfficeFormValues, } from "./UpdateOfficeForm";

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

describe("UpdateOfficeForm", () => {
  const initialValues: UpdateOfficeFormValues = {
    name: "Berlin Office",
    description: "Existing DE office",
    email: "berlin@example.com",
    phone: "+49 30 123456",
    country: "Germany",
    city: "Berlin",
    street: "Alexanderplatz",
    building: "1",
    postCode: "10178",
  };

  it("renders with initial values", () => {
    const onSubmit = jest.fn();

    render(
      <UpdateOfficeForm
        onSubmit={onSubmit}
        initialValues={initialValues}
      />,
    );

    expect(screen.getByLabelText("Name")).toHaveValue("Berlin Office");
    expect(screen.getByLabelText("Description")).toHaveValue(
      "Existing DE office",
    );
    expect(screen.getByLabelText("Email")).toHaveValue(
      "berlin@example.com",
    );
    expect(screen.getByLabelText("Phone")).toHaveValue("+49 30 123456");
    expect(screen.getByLabelText("Country")).toHaveValue("Germany");
    expect(screen.getByLabelText("City")).toHaveValue("Berlin");
    expect(screen.getByLabelText("Street")).toHaveValue("Alexanderplatz");
    expect(screen.getByLabelText("Building")).toHaveValue("1");
    expect(screen.getByLabelText("Post code")).toHaveValue("10178");
  });

  it("calls onSubmit with updated values when formRef.submitForm is called and form is valid", async () => {
    const onSubmit = jest.fn();
    const formRef = createRef<UpdateOfficeFormHandle | undefined>();

    render(
      <UpdateOfficeForm
        formRef={formRef}
        onSubmit={onSubmit}
        initialValues={initialValues}
      />,
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
    const formRef = createRef<UpdateOfficeFormHandle | undefined>();

    render(
      <UpdateOfficeForm
        formRef={formRef}
        onSubmit={onSubmit}
        initialValues={{ ...initialValues, name: "" }}
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
