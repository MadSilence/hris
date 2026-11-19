import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LoginContainer, { type SharedProvider } from "./LoginContainer";
import { useLoginAction } from "@/components/modules/auth/hooks/useLoginAction";
import { partialMock } from "@/test/types";
import { ApiError } from "@/components/clients/exceptions";

jest.mock("@/components/modules/auth/hooks/useLoginAction");
jest.mock("@/components/modules/auth/hooks/useAuthService");

import { useAuthService } from "@/components/modules/auth/hooks/useAuthService";
const loginCodeSend = jest.fn();
beforeEach(() => {
  loginCodeSend.mockResolvedValue({ ok: true });
  jest.mocked(useAuthService).mockReturnValue(partialMock<ReturnType<typeof useAuthService>>({ loginCodeSend }));
});

const mockedUseLoginAction = jest.mocked(useLoginAction);

const base = {
  brand: { kind: "company" as const, name: "Acme", logoUrl: null },
  sso: null,
  providers: [] as SharedProvider[],
  changeCompanyHref: "http://localhost:3000/login?another=1",
};

const loginAction = (mutateAsync: jest.Mock) =>
  mockedUseLoginAction.mockReturnValue(partialMock<ReturnType<typeof useLoginAction>>({ mutateAsync, isPending: false, error: null }));

describe("LoginContainer (sign-in-company-login)", () => {
  it("C1: the password form alone, under 'Log in to Acme'", () => {
    loginAction(jest.fn());
    render(<LoginContainer {...base} />);

    expect(screen.getByRole("heading", { name: "Log in to Acme" })).toBeInTheDocument();
    expect(screen.queryByText("or")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveAttribute("href", "/login/forgot");
  });

  it("C2: Google and Microsoft come first, then 'or', then the form", () => {
    loginAction(jest.fn());
    render(<LoginContainer {...base} providers={["GOOGLE", "MICROSOFT"]} />);

    expect(screen.getByRole("link", { name: "Continue with Google" })).toHaveAttribute(
      "href", "/api/auth/provider/start?purpose=SIGN_IN&provider=GOOGLE&next=%2Fdashboard");
    expect(screen.getByRole("link", { name: "Continue with Microsoft" })).toBeInTheDocument();
    expect(screen.getByText("or")).toBeInTheDocument();
  });

  it("C3 with Entra: the company's own button does not read as Microsoft", () => {
    loginAction(jest.fn());
    render(<LoginContainer {...base} sso={{ mode: "OPTIONAL", provider: "ENTRA", protocol: "OIDC", sharedProviders: [] }} providers={["MICROSOFT"]} />);

    expect(screen.getByRole("link", { name: "Log in with your company account" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continue with Microsoft" })).toBeInTheDocument();
  });

  it("C5: under required SSO only the company's button, and the System Owner's way in kept quiet", () => {
    loginAction(jest.fn());
    render(<LoginContainer {...base} sso={{ mode: "REQUIRED", provider: "OKTA", protocol: "OIDC", sharedProviders: [] }} providers={["GOOGLE"]} />);

    expect(screen.getByText("Acme logs in through Okta.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log in with Okta" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Continue with Google" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "System Owner login" })).toHaveAttribute("href", "/login/owner");
  });

  it("C9: a refusal is shown in the form, never thrown", async () => {
    const refusal = new Error("Invalid email or password");
    const mutateAsync = jest.fn().mockRejectedValue(refusal);
    loginAction(mutateAsync);
    const user = userEvent.setup();
    render(<LoginContainer {...base} />);

    await user.type(screen.getByLabelText("Email"), "nobody@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(mutateAsync).toHaveBeenCalledWith({ email: "nobody@example.com", password: "wrong" });
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("asks for the email and the password before asking the server", async () => {
    const mutateAsync = jest.fn();
    loginAction(mutateAsync);
    const user = userEvent.setup();
    render(<LoginContainer {...base} />);

    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(screen.getByText("Enter your email.")).toBeInTheDocument();
    expect(screen.getByText("Enter your password.")).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("C8 and N3: the notice above the form", () => {
    loginAction(jest.fn());
    const { rerender } = render(<LoginContainer {...base} notice="passwordChanged" />);
    expect(screen.getByText("Your password was changed. Log in with the new one.")).toBeInTheDocument();

    rerender(<LoginContainer {...base} notice="loggedOut" />);
    expect(screen.getByText("You were logged out. Log in again to pick up where you left off.")).toBeInTheDocument();
  });

  it("C10: Email me a login code sends one to the typed address and asks for it", async () => {
    loginAction(jest.fn());
    const user = userEvent.setup();
    render(<LoginContainer {...base} />);

    await user.click(screen.getByRole("button", { name: "Email me a login code" }));
    expect(screen.getByText("Enter your email.")).toBeInTheDocument();
    expect(loginCodeSend).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("Email"), "anna@acme.com");
    await user.click(screen.getByRole("button", { name: "Email me a login code" }));

    expect(loginCodeSend).toHaveBeenCalledWith("anna@acme.com");
    expect(await screen.findByRole("heading", { name: "Check your email" })).toBeInTheDocument();
  });

  it("C9: while the Email field shows an error, its error takes the code link's place", async () => {
    loginAction(jest.fn());
    const user = userEvent.setup();
    render(<LoginContainer {...base} />);

    await user.click(screen.getByRole("button", { name: "Log in" }));
    expect(screen.getByText("Enter your email.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Email me a login code" })).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Email"), "a");
    expect(screen.getByRole("button", { name: "Email me a login code" })).toBeInTheDocument();
  });

  it("C10: a refusal is the first thing in the form, above the provider buttons", async () => {
    loginAction(jest.fn().mockRejectedValue(new ApiError("Invalid email or password", { status: 401, code: "AUTH00001" })));
    const user = userEvent.setup();
    render(<LoginContainer {...base} providers={["GOOGLE"]} />);

    await user.type(screen.getByLabelText("Email"), "nobody@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("That email and password don’t match. Check them, or check the company address.");
    const google = screen.getByRole("link", { name: "Continue with Google" });
    expect(alert.compareDocumentPosition(google) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("C13, C15: resending a login code clears the error, empties the boxes and says a new code went", async () => {
    const loginCodeVerify = jest.fn().mockRejectedValue(new Error("nope"));
    jest.mocked(useAuthService).mockReturnValue(partialMock<ReturnType<typeof useAuthService>>({ loginCodeSend, loginCodeVerify }));
    loginAction(jest.fn());
    const user = userEvent.setup();
    render(<LoginContainer {...base} />);

    await user.type(screen.getByLabelText("Email"), "anna@acme.com");
    await user.click(screen.getByRole("button", { name: "Email me a login code" }));
    expect(await screen.findByText(/Didn’t get it\?/)).toBeInTheDocument();

    await user.type(screen.getByLabelText("Code 1"), "123456");
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "resend" }));
    expect(await screen.findByText("We’ve sent a new code. Check your spam folder too.")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Code 1")).toHaveValue("");
  });

  it("C11: the back arrow returns to the form with the address the code went to", async () => {
    loginAction(jest.fn());
    const user = userEvent.setup();
    render(<LoginContainer {...base} />);

    await user.type(screen.getByLabelText("Email"), "anna@acme.com");
    await user.click(screen.getByRole("button", { name: "Email me a login code" }));
    await user.click(await screen.findByRole("button", { name: "Back" }));

    expect(screen.getByLabelText("Email")).toHaveValue("anna@acme.com");
  });
});
