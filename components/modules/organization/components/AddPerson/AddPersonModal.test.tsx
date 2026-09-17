import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { AddPersonModal } from "./AddPersonModal";
import { ActionStatus } from "@/components/models/ActionStatus";
import { createUserAction } from "@/components/modules/organization/components/AddPerson/actions/createUserAction";

const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
jest.mock("@/components/modules/organization/components/AddPerson/actions/createUserAction");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AddPersonModal", () => {
  it("needs a first and a last name and nothing else", async () => {
    (createUserAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS, data: { id: "u9" } });
    const onClose = jest.fn();
    render(<AddPersonModal open onCloseAction={onClose} />);

    fireEvent.change(screen.getByLabelText("First Name *"), { target: { value: "Ada" } });
    fireEvent.change(screen.getByLabelText("Last Name *"), { target: { value: "Lovelace" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() =>
      expect(createUserAction).toHaveBeenCalledWith({
        firstName: "Ada",
        lastName: "Lovelace",
        email: null,
        hireDate: null,
      }),
    );
    // A draft is in no list, so the reader is taken to the profile where Invite lives.
    await waitFor(() => expect(push).toHaveBeenCalledWith("/organization/people/u9/personal"));
    expect(onClose).toHaveBeenCalled();
  });

  it("does not submit without a name", async () => {
    render(<AddPersonModal open onCloseAction={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByText("Enter a first name.")).toBeInTheDocument();
    expect(createUserAction).not.toHaveBeenCalled();
  });

  it("puts a taken address next to the email field", async () => {
    (createUserAction as jest.Mock).mockResolvedValue({
      status: ActionStatus.ERROR,
      errorMessage: "This email address is already used by another employee.",
      fieldErrors: { email: "This email address is already used by another employee." },
    });
    render(<AddPersonModal open onCloseAction={jest.fn()} />);

    fireEvent.change(screen.getByLabelText("First Name *"), { target: { value: "Ada" } });
    fireEvent.change(screen.getByLabelText("Last Name *"), { target: { value: "Lovelace" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ada@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByText("This email address is already used by another employee.")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
