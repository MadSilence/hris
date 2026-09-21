import * as React from "react";
import { render } from "@testing-library/react";
import LoginContainer from "./LoginContainer";
import { useLoginAction } from "@/components/modules/auth/hooks/useLoginAction";
import type { LoginFormValues } from "@/components/modules/auth/components/LoginForm/LoginForm";
import { partialMock } from "@/test/types";

jest.mock("@/components/modules/auth/hooks/useLoginAction");

let submitted: ((values: LoginFormValues) => void | Promise<void>) | undefined;
jest.mock("@/components/modules/auth/components/LoginForm/LoginForm", () => ({
  __esModule: true,
  default: (props: { onSubmitAction: (values: LoginFormValues) => void | Promise<void> }) => {
    submitted = props.onSubmitAction;
    return null;
  },
}));

const mockedUseLoginAction = jest.mocked(useLoginAction);

describe("LoginContainer", () => {
  it("does not reject the form's submit when the sign-in is refused — the refusal is shown, not thrown", async () => {
    const refusal = new Error("Invalid email or password");
    mockedUseLoginAction.mockReturnValue(
      partialMock<ReturnType<typeof useLoginAction>>({
        mutateAsync: jest.fn().mockRejectedValue(refusal),
        isPending: false,
        error: refusal,
      }),
    );

    render(<LoginContainer />);

    await expect(submitted!({ email: "nobody@example.com", password: "wrong" })).resolves.toBeUndefined();
  });
});
