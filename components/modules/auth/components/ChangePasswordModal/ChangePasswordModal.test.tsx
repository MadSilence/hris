import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ChangePasswordModal, passwordChangeNavigation } from "./ChangePasswordModal";
import { ActionStatus } from "@/components/models/ActionStatus";
import { changePasswordAction } from "@/components/modules/auth/actions/changePasswordAction";
import { useLogoutAction } from "@/components/modules/auth/hooks/useLogoutAction";
import { partialMock } from "@/test/types";

jest.mock("@/components/modules/auth/actions/changePasswordAction");
jest.mock("@/components/modules/auth/hooks/useLogoutAction");

const mockedChange = changePasswordAction as jest.MockedFunction<typeof changePasswordAction>;
const mockedUseLogout = useLogoutAction as jest.MockedFunction<typeof useLogoutAction>;
const logout = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  logout.mockResolvedValue({ ok: true });
  mockedUseLogout.mockReturnValue(partialMock<ReturnType<typeof useLogoutAction>>({ mutateAsync: logout }));
  mockedChange.mockResolvedValue({ status: ActionStatus.SUCCESS });
  jest.spyOn(passwordChangeNavigation, "toLogin").mockImplementation(() => undefined);
});

const fillAndSubmit = async (current: string, next: string, confirm: string) => {
  const user = userEvent.setup();
  if (current) await user.type(screen.getByLabelText(/^current password/i), current);
  await user.type(screen.getByLabelText(/^new password/i), next);
  await user.type(screen.getByLabelText(/^confirm password/i), confirm);
  await user.click(screen.getByRole("button", { name: "Change Password" }));
};

describe("ChangePasswordModal", () => {
  it("needs the current password", async () => {
    render(<ChangePasswordModal open onCloseAction={jest.fn()} />);

    await fillAndSubmit("", "Password1!", "Password1!");

    expect(await screen.findByText("Please enter your current password.")).toBeInTheDocument();
    expect(mockedChange).not.toHaveBeenCalled();
  });

  it("puts a wrong current password under that field and stays open", async () => {
    mockedChange.mockResolvedValue({
      status: ActionStatus.ERROR,
      code: "AUTH00004",
      errorMessage: "The current password is not correct.",
      fieldErrors: { currentPassword: "The current password is not correct." },
    });
    render(<ChangePasswordModal open onCloseAction={jest.fn()} />);

    await fillAndSubmit("Wrong1!!", "Password1!", "Password1!");

    const field = await screen.findByText("The current password is not correct.");
    expect(field.tagName).toBe("P");
    expect(logout).not.toHaveBeenCalled();
    expect(passwordChangeNavigation.toLogin).not.toHaveBeenCalled();
  });

  it("sends exactly the two fields, then signs out and goes to the sign-in screen", async () => {
    render(<ChangePasswordModal open onCloseAction={jest.fn()} />);

    await fillAndSubmit("OldPass1!", "Password1!", "Password1!");

    await waitFor(() =>
      expect(mockedChange).toHaveBeenCalledWith({ currentPassword: "OldPass1!", newPassword: "Password1!" }),
    );
    await waitFor(() => expect(passwordChangeNavigation.toLogin).toHaveBeenCalled());
    expect(logout).toHaveBeenCalled();
  });
});
