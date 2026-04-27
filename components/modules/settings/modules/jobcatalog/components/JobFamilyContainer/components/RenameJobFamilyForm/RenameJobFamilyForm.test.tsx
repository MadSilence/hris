import { ComponentProps } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RenameJobFamilyForm } from "./RenameJobFamilyForm";

const renderForm = (
  props?: Partial<ComponentProps<typeof RenameJobFamilyForm>>,
) => {
  const defaultProps: ComponentProps<typeof RenameJobFamilyForm> = {
    isLoading: false,
    onCancelAction: jest.fn(),
    onDirtyChangeAction: jest.fn(),
    onSubmitAction: jest.fn(),
  };

  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  return {
    ...render(<RenameJobFamilyForm {...mergedProps} />),
    props: mergedProps,
  };
};

describe("RenameJobFamilyForm", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders form fields and actions", () => {
    renderForm();

    expect(screen.getByLabelText(/name your job family/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/engineering/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("shows validation error when name is empty", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(onSubmitAction).not.toHaveBeenCalled();

    expect(
      await screen.findByText(/please enter a job family name/i),
    ).toBeInTheDocument();
  });

  it("shows validation error when name is too short", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.type(screen.getByLabelText(/name your job family/i), "HR");
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(onSubmitAction).not.toHaveBeenCalled();

    expect(
      await screen.findByText(/name must be at least 3 characters long/i),
    ).toBeInTheDocument();
  });

  it("submits trimmed values", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.type(
      screen.getByLabelText(/name your job family/i),
      " Engineering ",
    );

    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledWith({
        name: "Engineering",
      });
    });
  });

  it("submits by Enter", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.type(
      screen.getByLabelText(/name your job family/i),
      "Engineering{enter}",
    );

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledWith({
        name: "Engineering",
      });
    });
  });

  it("calls cancel action", async () => {
    const user = userEvent.setup();
    const onCancelAction = jest.fn();

    renderForm({ onCancelAction });

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancelAction).toHaveBeenCalledTimes(1);
  });

  it("reports dirty state after input change", async () => {
    const user = userEvent.setup();
    const onDirtyChangeAction = jest.fn();

    renderForm({ onDirtyChangeAction });

    await user.type(
      screen.getByLabelText(/name your job family/i),
      "Engineering",
    );

    await waitFor(() => {
      expect(onDirtyChangeAction).toHaveBeenCalledWith(true);
    });
  });

  it("does not submit or cancel while loading", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();
    const onCancelAction = jest.fn();

    renderForm({
      isLoading: true,
      onSubmitAction,
      onCancelAction,
    });

    expect(screen.getByLabelText(/name your job family/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(onCancelAction).not.toHaveBeenCalled();
    expect(onSubmitAction).not.toHaveBeenCalled();
  });
});
