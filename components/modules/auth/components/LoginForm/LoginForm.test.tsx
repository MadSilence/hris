import { ComponentProps } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LoginForm from "@/components/modules/auth/components/LoginForm/LoginForm";

const renderForm = (props?: Partial<ComponentProps<typeof LoginForm>>) => {
  const defaultProps: ComponentProps<typeof LoginForm> = {
    isLoading: false,
    apiError: undefined,
    onSubmitAction: jest.fn(),
  };

  return {
    ...render(<LoginForm {...defaultProps} {...props} />),
    props: {
      ...defaultProps,
      ...props,
    },
  };
};

describe("LoginForm", () => {
  it("shows validation errors when required fields are empty", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(onSubmitAction).not.toHaveBeenCalled();

    expect(
      await screen.findByText(/please enter your email/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/please enter your password/i),
    ).toBeInTheDocument();
  });

  it("shows validation error when email is invalid", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.type(screen.getByLabelText(/email address/i), "wrong-email");
    await user.type(screen.getByLabelText(/password/i), "Password1!");

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(onSubmitAction).not.toHaveBeenCalled();

    expect(
      await screen.findByText(/enter a valid email address/i),
    ).toBeInTheDocument();
  });

  it("shows validation error when password is too short", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.type(screen.getByLabelText(/email address/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "short");

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(onSubmitAction).not.toHaveBeenCalled();

    expect(
      await screen.findByText("Password must be at least 8 characters."),
    ).toBeInTheDocument();
  });

  it("submits sanitized values", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.type(screen.getByLabelText(/email address/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "Password1!");

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "Password1!",
      });
    });
  });

  it("does not submit while loading", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({
      isLoading: true,
      onSubmitAction,
    });

    expect(screen.getByLabelText(/email address/i)).toBeDisabled();
    expect(screen.getByLabelText(/password/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /signing in/i }));

    expect(onSubmitAction).not.toHaveBeenCalled();
  });

  it("shows api error", () => {
    renderForm({
      apiError: "Invalid credentials",
    });

    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
