import { ComponentProps } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ConfirmTrialForm from "@/components/modules/trial/components/SetPasswordForm/ConfirmTrialForm";

const renderForm = (
  props?: Partial<ComponentProps<typeof ConfirmTrialForm>>,
) => {
  const defaultProps: ComponentProps<typeof ConfirmTrialForm> = {
    isLoading: false,
    isSuccess: false,
    apiError: undefined,
    onSubmitAction: jest.fn(),
  };

  return {
    ...render(<ConfirmTrialForm {...defaultProps} {...props} />),
    props: {
      ...defaultProps,
      ...props,
    },
  };
};

describe("ConfirmTrialForm", () => {
  it("shows validation errors when required fields are empty", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.click(screen.getByRole("button", { name: /set password/i }));

    expect(onSubmitAction).not.toHaveBeenCalled();

    expect(
      await screen.findByText(/please enter a password/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/please confirm your password/i),
    ).toBeInTheDocument();
  });

  it("shows validation error when password is too short", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.type(screen.getByLabelText(/^password$/i), "Aa1!");
    await user.type(screen.getByLabelText(/confirm password/i), "Aa1!");

    await user.click(screen.getByRole("button", { name: /set password/i }));

    expect(onSubmitAction).not.toHaveBeenCalled();

    expect(
      await screen.findByText("Use at least 8 characters."),
    ).toBeInTheDocument();
  });

  it("shows validation error when password is weak", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.type(screen.getByLabelText(/^password$/i), "password1");
    await user.type(screen.getByLabelText(/confirm password/i), "password1");

    await user.click(screen.getByRole("button", { name: /set password/i }));

    expect(onSubmitAction).not.toHaveBeenCalled();

    expect(
      await screen.findByText(
        /use upper & lower case letters, a number and a symbol/i,
      ),
    ).toBeInTheDocument();
  });

  it("shows validation error when passwords do not match", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.type(screen.getByLabelText(/^password$/i), "Password1!");
    await user.type(screen.getByLabelText(/confirm password/i), "Password2!");

    await user.click(screen.getByRole("button", { name: /set password/i }));

    expect(onSubmitAction).not.toHaveBeenCalled();

    expect(await screen.findByText(/passwords don’t match/i)).toBeInTheDocument();
  });

  it("submits valid values", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.type(screen.getByLabelText(/^password$/i), "Password1!");
    await user.type(screen.getByLabelText(/confirm password/i), "Password1!");

    await user.click(screen.getByRole("button", { name: /set password/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledWith({
        password: "Password1!",
        confirmPassword: "Password1!",
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

    expect(screen.getByLabelText(/^password$/i)).toBeDisabled();
    expect(screen.getByLabelText(/confirm password/i)).toBeDisabled();

    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /saving/i }));

    expect(onSubmitAction).not.toHaveBeenCalled();
  });

  it("shows api error", () => {
    renderForm({
      apiError: "Invalid or expired token",
    });

    expect(screen.getByText(/invalid or expired token/i)).toBeInTheDocument();
  });

  it("shows success state", () => {
    renderForm({
      isSuccess: true,
    });

    expect(
      screen.getByRole("heading", { name: /password set/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/your password has been created/i),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /set password/i }),
    ).not.toBeInTheDocument();
  });
});
