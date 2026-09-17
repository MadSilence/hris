import { ComponentProps } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RenameAttributeGroupForm } from "./RenameAttributeGroupForm";

const renderForm = (
  props?: Partial<ComponentProps<typeof RenameAttributeGroupForm>>,
) => {
  const defaultProps: ComponentProps<typeof RenameAttributeGroupForm> = {
    isLoading: false,
    initialName: "Uniform",
    initialDescription: "Sizes for the kit order",
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
    expect(screen.getByLabelText(/^description$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("prefills the current name and description", () => {
    renderForm();

    expect(screen.getByLabelText(/name your section/i)).toHaveValue("Uniform");
    expect(screen.getByLabelText(/^description$/i)).toHaveValue("Sizes for the kit order");
  });

  it("keeps Save off until something changed", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();

    await user.type(screen.getByLabelText(/^description$/i), ".");

    expect(screen.getByRole("button", { name: /save/i })).toBeEnabled();
  });

  it("shows validation error when name is empty", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.clear(screen.getByLabelText(/name your section/i));
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(onSubmitAction).not.toHaveBeenCalled();

    expect(
      await screen.findByText(/please enter a section name/i),
    ).toBeInTheDocument();
  });

  it("shows validation error when name is too short", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.clear(screen.getByLabelText(/name your section/i));
    await user.type(screen.getByLabelText(/name your section/i), "HR");
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(onSubmitAction).not.toHaveBeenCalled();

    expect(
      await screen.findByText(/name must be at least 3 characters long/i),
    ).toBeInTheDocument();
  });

  it("refuses a description over 1000 characters", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction, initialDescription: "" });

    await user.click(screen.getByLabelText(/^description$/i));
    await user.paste("x".repeat(1001));
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(onSubmitAction).not.toHaveBeenCalled();

    expect(
      await screen.findByText(/description must be 1000 characters or fewer/i),
    ).toBeInTheDocument();
  });

  it("submits trimmed values", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.clear(screen.getByLabelText(/name your section/i));
    await user.type(screen.getByLabelText(/name your section/i), " HR Info ");
    await user.clear(screen.getByLabelText(/^description$/i));
    await user.type(screen.getByLabelText(/^description$/i), " Who to call ");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledWith({
        name: "HR Info",
        description: "Who to call",
      });
    });
  });

  it("submits a description-only change with the name kept", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.clear(screen.getByLabelText(/^description$/i));
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledWith({
        name: "Uniform",
        description: "",
      });
    });
  });

  it("submits by Enter", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.clear(screen.getByLabelText(/name your section/i));
    await user.type(
      screen.getByLabelText(/name your section/i),
      "HR Info{enter}",
    );

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledWith({
        name: "HR Info",
        description: "Sizes for the kit order",
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

    await user.type(screen.getByLabelText(/name your section/i), " Info");

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
    expect(screen.getByLabelText(/^description$/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(onCancelAction).not.toHaveBeenCalled();
    expect(onSubmitAction).not.toHaveBeenCalled();
  });
});
