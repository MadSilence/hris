import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ResetPasswordContainer } from "./ResetPasswordContainer";
import { ActionStatus } from "@/components/models/ActionStatus";
import { resetPasswordAction } from "@/components/modules/passwordReset/actions/passwordResetActions";

jest.mock("@/components/modules/passwordReset/actions/passwordResetActions");

const mockedReset = resetPasswordAction as jest.MockedFunction<typeof resetPasswordAction>;

beforeEach(() => {
  jest.clearAllMocks();
  mockedReset.mockResolvedValue({ status: ActionStatus.SUCCESS });
});

const fill = async (password: string, confirm: string) => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/^new password/i), password);
  await user.type(screen.getByLabelText(/^confirm password/i), confirm);
  await user.click(screen.getByRole("button", { name: "Set Password" }));
};

describe("ResetPasswordContainer", () => {
  it("greets the person the link is for", () => {
    render(<ResetPasswordContainer token="t1" firstName="Ada" />);

    expect(screen.getByRole("heading", { name: "Hi Ada" })).toBeInTheDocument();
  });

  it("asks for both fields before sending anything", async () => {
    render(<ResetPasswordContainer token="t1" firstName="Ada" />);

    await userEvent.setup().click(screen.getByRole("button", { name: "Set Password" }));

    expect(await screen.findByText("Please enter a password.")).toBeInTheDocument();
    expect(screen.getByText("Please confirm your password.")).toBeInTheDocument();
    expect(mockedReset).not.toHaveBeenCalled();
  });

  it("holds the new password to the signup rule", async () => {
    render(<ResetPasswordContainer token="t1" firstName={null} />);

    await fill("password1", "password1");

    expect(await screen.findByText("Use upper & lower case letters, a number and a symbol.")).toBeInTheDocument();
    expect(mockedReset).not.toHaveBeenCalled();
  });

  it("refuses two passwords that differ", async () => {
    render(<ResetPasswordContainer token="t1" firstName={null} />);

    await fill("Password1!", "Password2!");

    expect(await screen.findByText("Passwords don’t match.")).toBeInTheDocument();
    expect(mockedReset).not.toHaveBeenCalled();
  });

  it("sends the token with the new password, then offers to sign in", async () => {
    render(<ResetPasswordContainer token="t1" firstName="Ada" />);

    await fill("Password1!", "Password1!");

    await waitFor(() => expect(mockedReset).toHaveBeenCalledWith({ token: "t1", password: "Password1!" }));
    expect(await screen.findByRole("heading", { name: "Password Changed" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign In" })).toHaveAttribute("href", "/login");
  });

  it("says a stale link is stale and offers a new one", async () => {
    mockedReset.mockResolvedValue({
      status: ActionStatus.ERROR,
      code: "AUTH00003",
      errorMessage: "This password reset link is no longer valid. Ask for a new one.",
    });
    render(<ResetPasswordContainer token="t1" firstName="Ada" />);

    await fill("Password1!", "Password1!");

    expect(await screen.findByText("This password reset link is no longer valid. Ask for a new one.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Request a New Link" })).toHaveAttribute("href", "/forgot-password");
  });
});
