import { ComponentProps } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateOfficeForm } from "./CreateOfficeForm";

const renderForm = (
  props?: Partial<ComponentProps<typeof CreateOfficeForm>>,
) => {
  const defaultProps: ComponentProps<typeof CreateOfficeForm> = {
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
    ...render(<CreateOfficeForm {...mergedProps} />),
    props: mergedProps,
  };
};

describe("CreateOfficeForm", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders form fields and actions", () => {
    renderForm();

    expect(screen.getByText(/office details/i)).toBeInTheDocument();
    expect(screen.getByText(/address/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/street/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/building/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/post code/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
  });

  it("shows validation errors when required fields are empty", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.click(screen.getByRole("button", { name: /create/i }));

    expect(onSubmitAction).not.toHaveBeenCalled();

    expect(
      await screen.findByText(/please enter an office name/i),
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/please enter a country/i),
    ).toBeInTheDocument();

    expect(await screen.findByText(/please enter a city/i)).toBeInTheDocument();
  });

  it("shows validation error for invalid email", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.type(screen.getByLabelText(/^name$/i), "London HQ");
    await user.type(screen.getByLabelText(/country/i), "United Kingdom");
    await user.type(screen.getByLabelText(/city/i), "London");
    await user.type(screen.getByLabelText(/email/i), "wrong-email");

    await user.click(screen.getByRole("button", { name: /create/i }));

    expect(onSubmitAction).not.toHaveBeenCalled();

    expect(await screen.findByText(/email must be a valid email/i)).toBeInTheDocument();
  });

  it("submits trimmed values", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.type(screen.getByLabelText(/^name$/i), " London HQ ");
    await user.type(screen.getByLabelText(/description/i), " Main office ");
    await user.type(screen.getByLabelText(/email/i), " office@example.com ");
    await user.type(screen.getByLabelText(/phone/i), " +44 123 ");
    await user.type(screen.getByLabelText(/country/i), " United Kingdom ");
    await user.type(screen.getByLabelText(/city/i), " London ");
    await user.type(screen.getByLabelText(/street/i), " Baker Street ");
    await user.type(screen.getByLabelText(/building/i), " 221B ");
    await user.type(screen.getByLabelText(/post code/i), " NW1 ");

    await user.click(screen.getByRole("button", { name: /create/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledWith({
        name: "London HQ",
        description: "Main office",
        email: "office@example.com",
        phone: "+44 123",
        country: "United Kingdom",
        city: "London",
        street: "Baker Street",
        building: "221B",
        postCode: "NW1",
      });
    });
  });

  it("submits by Enter", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.type(screen.getByLabelText(/^name$/i), "London HQ");
    await user.type(screen.getByLabelText(/country/i), "United Kingdom");
    await user.type(screen.getByLabelText(/city/i), "London{enter}");

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "London HQ",
          country: "United Kingdom",
          city: "London",
        }),
      );
    });
  });

  it("uses initial values", () => {
    renderForm({
      initialValues: {
        name: "London HQ",
        country: "United Kingdom",
        city: "London",
      },
    });

    expect(screen.getByLabelText(/^name$/i)).toHaveValue("London HQ");
    expect(screen.getByLabelText(/country/i)).toHaveValue("United Kingdom");
    expect(screen.getByLabelText(/city/i)).toHaveValue("London");
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

    await user.type(screen.getByLabelText(/^name$/i), "London HQ");

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

    expect(screen.getByLabelText(/^name$/i)).toBeDisabled();
    expect(screen.getByLabelText(/description/i)).toBeDisabled();
    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/phone/i)).toBeDisabled();
    expect(screen.getByLabelText(/country/i)).toBeDisabled();
    expect(screen.getByLabelText(/city/i)).toBeDisabled();

    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /create/i })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    await user.click(screen.getByRole("button", { name: /create/i }));

    expect(onCancelAction).not.toHaveBeenCalled();
    expect(onSubmitAction).not.toHaveBeenCalled();
  });
});
