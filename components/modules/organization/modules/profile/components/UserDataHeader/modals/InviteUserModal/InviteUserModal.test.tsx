import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { InviteUserModal } from "./InviteUserModal";
import { ActionStatus } from "@/components/models/ActionStatus";
import { inviteUserAction } from "@/components/modules/organization/modules/profile/actions/userLifecycleActions/userLifecycleActions";

jest.mock("@/components/modules/organization/modules/profile/actions/userLifecycleActions/userLifecycleActions");

beforeEach(() => {
  jest.clearAllMocks();
  (inviteUserAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS });
});

const renderModal = (props: Partial<React.ComponentProps<typeof InviteUserModal>> = {}) => {
  const onClose = jest.fn();
  const onInvited = jest.fn();
  render(
    <InviteUserModal
      open
      userId="u1"
      fullName="Ada Lovelace"
      email={null}
      onCloseAction={onClose}
      onInvitedAction={onInvited}
      {...props}
    />,
  );
  return { onClose, onInvited };
};

describe("InviteUserModal", () => {
  it("asks for an address when the person has none, instead of refusing", async () => {
    renderModal();

    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("Enter an email address to send the invitation to.")).toBeInTheDocument();
    expect(inviteUserAction).not.toHaveBeenCalled();
  });

  it("sends now with the address typed into it", async () => {
    const { onClose, onInvited } = renderModal();

    fireEvent.change(screen.getByLabelText("Email *"), { target: { value: "ada@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() =>
      expect(inviteUserAction).toHaveBeenCalledWith({ userId: "u1", email: "ada@example.com", sendOn: null, preboarding: null }),
    );
    await waitFor(() => expect(onInvited).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
  });

  it("does not resend the address already on record", async () => {
    renderModal({ email: "ada@example.com" });

    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() =>
      expect(inviteUserAction).toHaveBeenCalledWith({ userId: "u1", email: null, sendOn: null, preboarding: null }),
    );
  });

  it("asks what happens to an unfinished preboarding, then sends with the answer", async () => {
    (inviteUserAction as jest.Mock)
      .mockResolvedValueOnce({ status: ActionStatus.ERROR, code: "LC00034", errorMessage: "unfinished" })
      .mockResolvedValueOnce({ status: ActionStatus.SUCCESS });
    const { onInvited } = renderModal({ email: "ada@example.com" });

    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByText("Ada Lovelace has an unfinished preboarding.")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/End It Early/));
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() =>
      expect(inviteUserAction).toHaveBeenLastCalledWith({ userId: "u1", email: null, sendOn: null, preboarding: "END" }),
    );
    await waitFor(() => expect(onInvited).toHaveBeenCalled());
  });

  it("needs a day before it schedules", async () => {
    renderModal({ email: "ada@example.com" });

    fireEvent.click(screen.getByLabelText("On a Date"));
    fireEvent.click(await screen.findByRole("button", { name: "Schedule" }));

    expect(await screen.findByText("Pick the day to send it.")).toBeInTheDocument();
    expect(inviteUserAction).not.toHaveBeenCalled();
  });
});
