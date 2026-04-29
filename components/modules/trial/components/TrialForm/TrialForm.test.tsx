import { ComponentProps } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TrialForm from "@/components/modules/trial/components/TrialForm/TrialForm";

const renderForm = (props?: Partial<ComponentProps<typeof TrialForm>>) => {
  const defaultProps: ComponentProps<typeof TrialForm> = {
    isLoading: false,
    isSuccess: false,
    apiError: undefined,
    onSubmitAction: jest.fn(),
  };

  return {
    ...render(<TrialForm {...defaultProps} {...props} />),
    props: {
      ...defaultProps,
      ...props,
    },
  };
};

describe("TrialForm", () => {
  it("shows validation errors when required fields are empty", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.click(
      screen.getByRole("button", { name: /start your free trial/i }),
    );

    expect(onSubmitAction).not.toHaveBeenCalled();

    expect(
      await screen.findByText(/please enter your business email/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/please enter your first name/i)).toBeInTheDocument();
    expect(screen.getByText(/please enter your last name/i)).toBeInTheDocument();
    expect(screen.getByText(/please choose a subdomain/i)).toBeInTheDocument();
    expect(
      screen.getByText(/please accept the privacy terms to continue/i),
    ).toBeInTheDocument();
  });

  it("shows validation error when email is invalid", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.type(screen.getByLabelText(/business email/i), "wrong-email");

    await user.click(
      screen.getByRole("button", { name: /start your free trial/i }),
    );

    expect(onSubmitAction).not.toHaveBeenCalled();

    expect(
      await screen.findByText(/enter a valid email address/i),
    ).toBeInTheDocument();
  });

  it("normalizes company name into subdomain while typing", async () => {
    const user = userEvent.setup();

    renderForm();

    await user.type(screen.getByLabelText(/company name/i), "Acme Company!");

    expect(screen.getByLabelText(/company name/i)).toHaveValue("acmecompany");
  });

  it("submits sanitized values", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.type(screen.getByLabelText(/business email/i), "test@example.com");
    await user.type(screen.getByLabelText(/first name/i), " John ");
    await user.type(screen.getByLabelText(/last name/i), " Doe ");
    await user.type(screen.getByLabelText(/company name/i), "Acme Company");
    await user.click(screen.getByLabelText(/by submitting this form/i));

    await user.click(
      screen.getByRole("button", { name: /start your free trial/i }),
    );

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledWith({
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        companyName: "acmecompany",
        consent: true,
      });
    });
  });

  it("submits by Enter", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.type(screen.getByLabelText(/business email/i), "test@example.com");
    await user.type(screen.getByLabelText(/first name/i), "John");
    await user.type(screen.getByLabelText(/last name/i), "Doe");
    await user.type(screen.getByLabelText(/company name/i), "acme");
    await user.click(screen.getByLabelText(/by submitting this form/i));

    await user.type(screen.getByLabelText(/company name/i), "{enter}");

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalled();
    });
  });

  it("does not submit while loading", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({
      isLoading: true,
      onSubmitAction,
    });

    expect(screen.getByLabelText(/business email/i)).toBeDisabled();
    expect(screen.getByLabelText(/first name/i)).toBeDisabled();
    expect(screen.getByLabelText(/last name/i)).toBeDisabled();
    expect(screen.getByLabelText(/company name/i)).toBeDisabled();

    expect(
      screen.getByRole("button", { name: /starting your trial/i }),
    ).toBeDisabled();

    await user.click(
      screen.getByRole("button", { name: /starting your trial/i }),
    );

    expect(onSubmitAction).not.toHaveBeenCalled();
  });

  it("shows api error", () => {
    renderForm({
      apiError: "Something went wrong",
    });

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it("shows success state", () => {
    renderForm({
      isSuccess: true,
    });

    expect(
      screen.getByRole("heading", { name: /check your inbox/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/we’ve sent a verification link/i),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /start your free trial/i }),
    ).not.toBeInTheDocument();
  });
});
