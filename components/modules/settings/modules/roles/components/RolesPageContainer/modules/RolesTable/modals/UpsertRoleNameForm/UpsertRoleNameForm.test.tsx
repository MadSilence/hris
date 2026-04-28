import { fireEvent, render, screen, waitFor, } from "@testing-library/react";

import { UpsertRoleNameForm } from "./UpsertRoleNameForm";

describe("UpsertRoleNameForm", () => {
  it("renders initial values", () => {
    render(
      <UpsertRoleNameForm
        initialName="Admins"
        submitText="Save"
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    expect(
      screen.getByLabelText(/role name/i),
    ).toHaveValue("Admins");
  });

  it("submits trimmed value", async () => {
    const onSubmitAction = jest.fn();

    render(
      <UpsertRoleNameForm
        initialName="Admins"
        submitText="Save"
        onCancelAction={jest.fn()}
        onSubmitAction={onSubmitAction}
      />,
    );

    fireEvent.change(
      screen.getByLabelText(/role name/i),
      {
        target: {
          value: "  Managers  ",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /save/i,
      }),
    );

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledWith({
        name: "Managers",
      });
    });
  });

  it("calls cancel", () => {
    const onCancelAction = jest.fn();

    render(
      <UpsertRoleNameForm
        initialName="Admins"
        submitText="Save"
        onCancelAction={onCancelAction}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /cancel/i,
      }),
    );

    expect(onCancelAction).toHaveBeenCalled();
  });

  it("disables submit for short value", () => {
    render(
      <UpsertRoleNameForm
        initialName=""
        submitText="Save"
        onCancelAction={jest.fn()}
        onSubmitAction={jest.fn()}
      />,
    );

    fireEvent.change(
      screen.getByLabelText(/role name/i),
      {
        target: { value: "A" },
      },
    );

    expect(
      screen.getByRole("button", {
        name: /save/i,
      }),
    ).toBeDisabled();
  });
});
