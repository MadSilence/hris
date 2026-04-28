import { fireEvent, render, screen } from "@testing-library/react";
import { ComponentProps } from "react";

import { AddRoleModal } from "./AddRoleModal";

const mockAddRoleForm = jest.fn();

let mockedFormSubmission = {
  useTemplate: false,
  name: "HR Manager",
  templateId: "",
  templateName: "",
};

jest.mock("../AddRoleForm/AddRoleForm", () => ({
  AddRoleForm: (props: any) => {
    mockAddRoleForm(props);

    return (
      <div>
        <input
          aria-label="Role name"
          onChange={() => props.onDirtyChangeAction?.(true)}
          disabled={props.isLoading}
        />

        <button
          type="button"
          disabled={props.isLoading}
          onClick={props.onCancelAction}
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={props.isLoading}
          onClick={() => props.onSubmitAction(mockedFormSubmission)}
        >
          Create
        </button>
      </div>
    );
  },
}));

const templates = [
  {
    id: "admin",
    name: "Admin",
    description: "Admin permissions",
  },
];

const renderModal = (props?: Partial<ComponentProps<typeof AddRoleModal>>) => {
  const defaultProps: ComponentProps<typeof AddRoleModal> = {
    isOpen: true,
    isLoading: false,
    templates,
    onCancelAction: jest.fn(),
    onCreateBlankAction: jest.fn(),
    onCreateFromTemplateAction: jest.fn(),
  };

  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  return {
    ...render(<AddRoleModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("AddRoleModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedFormSubmission = {
      useTemplate: false,
      name: "HR Manager",
      templateId: "",
      templateName: "",
    };
  });

  it("renders modal content", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /add new role/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /create a new role from scratch or start from a template/i,
      ),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/role name/i)).toBeInTheDocument();
  });

  it("passes loading state and templates to form", () => {
    renderModal({ isLoading: true });

    expect(mockAddRoleForm).toHaveBeenCalledWith(
      expect.objectContaining({
        isLoading: true,
        templates,
      }),
    );

    expect(screen.getByLabelText(/role name/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /create/i })).toBeDisabled();
  });

  it("calls create blank action from form submit", () => {
    const onCreateBlankAction = jest.fn();

    renderModal({ onCreateBlankAction });

    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    expect(onCreateBlankAction).toHaveBeenCalledWith({
      name: "HR Manager",
    });
  });

  it("calls create from template action from form submit", () => {
    const onCreateFromTemplateAction = jest.fn();

    mockedFormSubmission = {
      useTemplate: true,
      name: "",
      templateId: "admin",
      templateName: "Custom Admin",
    };

    renderModal({ onCreateFromTemplateAction });

    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    expect(onCreateFromTemplateAction).toHaveBeenCalledWith({
      templateId: "admin",
      name: "Custom Admin",
    });
  });

  it("passes undefined name when template name is empty", () => {
    const onCreateFromTemplateAction = jest.fn();

    mockedFormSubmission = {
      useTemplate: true,
      name: "",
      templateId: "admin",
      templateName: "",
    };

    renderModal({ onCreateFromTemplateAction });

    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    expect(onCreateFromTemplateAction).toHaveBeenCalledWith({
      templateId: "admin",
      name: undefined,
    });
  });

  it("closes by Cancel when form is not dirty", () => {
    const onCancelAction = jest.fn();

    renderModal({ onCancelAction });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancelAction).toHaveBeenCalledTimes(1);
  });

  it("opens confirm cancel modal on Cancel when form is dirty", () => {
    const onCancelAction = jest.fn();

    renderModal({ onCancelAction });

    fireEvent.change(screen.getByLabelText(/role name/i), {
      target: { value: "HR Manager" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancelAction).not.toHaveBeenCalled();

    expect(
      screen.getByRole("heading", { name: /discard changes/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/you have unsaved changes/i)).toBeInTheDocument();
  });

  it("keeps modal open when confirm cancel is cancelled", () => {
    const onCancelAction = jest.fn();

    renderModal({ onCancelAction });

    fireEvent.change(screen.getByLabelText(/role name/i), {
      target: { value: "HR Manager" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(screen.getByRole("button", { name: /keep editing/i }));

    expect(onCancelAction).not.toHaveBeenCalled();

    expect(
      screen.getByRole("heading", { name: /add new role/i }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: /discard changes/i }),
    ).not.toBeInTheDocument();
  });

  it("closes modal when dirty close is confirmed", () => {
    const onCancelAction = jest.fn();

    renderModal({ onCancelAction });

    fireEvent.change(screen.getByLabelText(/role name/i), {
      target: { value: "HR Manager" },
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(screen.getByRole("button", { name: /discard/i }));

    expect(onCancelAction).toHaveBeenCalledTimes(1);
  });

  it("does not close while loading", () => {
    const onCancelAction = jest.fn();

    renderModal({
      isLoading: true,
      onCancelAction,
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancelAction).not.toHaveBeenCalled();

    expect(
      screen.queryByRole("heading", { name: /discard changes/i }),
    ).not.toBeInTheDocument();
  });
});
