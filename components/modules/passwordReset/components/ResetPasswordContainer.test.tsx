import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ResetPasswordContainer } from "./ResetPasswordContainer";
import { ActionStatus } from "@/components/models/ActionStatus";
import { resetPasswordAction } from "@/components/modules/passwordReset/actions/passwordResetActions";

jest.mock("@/components/modules/passwordReset/actions/passwordResetActions");

const mockedReset = resetPasswordAction as jest.MockedFunction<typeof resetPasswordAction>;
const brand = { kind: "company" as const, name: "Acme", logoUrl: null };

beforeEach(() => {
  jest.clearAllMocks();
  mockedReset.mockResolvedValue({ status: ActionStatus.SUCCESS });
});

const setPassword = async (password: string) => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("New password"), password);
  await user.click(screen.getByRole("button", { name: "Set password" }));
};

describe("ResetPasswordContainer (sign-in-password F3–F7)", () => {
  it("says which account the link is for, and asks for one password — no confirmation", () => {
    render(<ResetPasswordContainer brand={brand} token="t1" email="anna@acme.com" codeRequired={false} connectedProviders={[]} />);

    expect(screen.getByRole("heading", { name: "Set a password" })).toBeInTheDocument();
    expect(screen.getByText("anna@acme.com")).toBeInTheDocument();
    expect(screen.queryByLabelText(/confirm/i)).not.toBeInTheDocument();
  });

  it("refuses fewer than 12 characters before asking the server", async () => {
    render(<ResetPasswordContainer brand={brand} token="t1" email={null} codeRequired={false} connectedProviders={[]} />);

    await setPassword("short-pass1");

    expect(screen.getByText("Use at least 12 characters.")).toBeInTheDocument();
    expect(mockedReset).not.toHaveBeenCalled();
  });

  it("sets the password with no composition rule, and says the old sessions ended", async () => {
    render(<ResetPasswordContainer brand={brand} token="t1" email={null} codeRequired={false} connectedProviders={[]} />);

    await setPassword("tram lilac river");

    expect(mockedReset).toHaveBeenCalledWith({ token: "t1", password: "tram lilac river", code: undefined });
    expect(await screen.findByRole("heading", { name: "Password changed" })).toBeInTheDocument();
  });

  it("warns that a connected Google account is disconnected by this reset (F4)", () => {
    render(<ResetPasswordContainer brand={brand} token="t1" email={null} codeRequired={false} connectedProviders={["GOOGLE"]} />);

    expect(screen.getByText("Setting a password this way disconnects Google.", { exact: false })).toBeInTheDocument();
  });

  it("asks a locked account with a factor for its code too (F6)", async () => {
    render(<ResetPasswordContainer brand={brand} token="t1" email={null} codeRequired connectedProviders={[]} />);

    await setPassword("tram lilac river");

    expect(screen.getByText("Enter the code.")).toBeInTheDocument();
    expect(mockedReset).not.toHaveBeenCalled();
  });
});
