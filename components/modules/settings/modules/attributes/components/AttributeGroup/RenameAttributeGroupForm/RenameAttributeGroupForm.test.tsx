import { ComponentProps } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RenameAttributeGroupForm } from "./RenameAttributeGroupForm";

const renderForm = (
  props?: Partial<ComponentProps<typeof RenameAttributeGroupForm>>,
) => {
  const defaultProps: ComponentProps<typeof RenameAttributeGroupForm> = {
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
    ...render(<RenameAttributeGroupForm {...mergedProps} />),
    props: mergedProps,
  };
};

describe("RenameAttributeGroupForm", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders form fields and actions", () => {
    renderForm();

    expect(screen.getByLabelText(/name your section/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/hr information/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /rename/i })).toBeInTheDocument();
  });

  it("shows validation error when name is empty", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.click(screen.getByRole("button", { name: /rename/i }));

    expect(onSubmitAction).not.toHaveBeenCalled();

    expect(
      await screen.findByText(/please enter a section name/i),
    ).toBeInTheDocument();
  });

  it("shows validation error when name is too short", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.type(screen.getByLabelText(/name your section/i), "HR");
    await user.click(screen.getByRole("button", { name: /rename/i }));

    expect(onSubmitAction).not.toHaveBeenCalled();

    expect(
      await screen.findByText(/name must be at least 3 characters long/i),
    ).toBeInTheDocument();
  });

  it("submits trimmed values", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.type(screen.getByLabelText(/name your section/i), " HR Info ");
    await user.click(screen.getByRole("button", { name: /rename/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledWith({
        name: "HR Info",
      });
    });
  });

  it("submits by Enter", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.type(
      screen.getByLabelText(/name your section/i),
      "HR Info{enter}",
    );

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledWith({
        name: "HR Info",
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

    await user.type(screen.getByLabelText(/name your section/i), "HR Info");

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

    expect(screen.getByLabelText(/name your section/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /rename/i })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    await user.click(screen.getByRole("button", { name: /rename/i }));

    expect(onCancelAction).not.toHaveBeenCalled();
    expect(onSubmitAction).not.toHaveBeenCalled();
  });
});
