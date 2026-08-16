import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  UpsertRoleNameModal
} from "@/components/modules/settings/modules/roles/components/RolesPageContainer/modules/RolesTable/modals/UpsertRoleNameModal/UpsertRoleNameModal";

const mockForm = jest.fn();

jest.mock("../UpsertRoleNameForm/UpsertRoleNameForm", () => ({
  UpsertRoleNameForm: (props: any) => {
    mockForm(props);

    return (
      <div>
        <button
          type="button"
          onClick={props.onCancelAction}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() =>
            props.onSubmitAction({ name: "Managers" })
          }
        >
          {props.submitText}
        </button>
      </div>
    );
  },
}));

const renderModal = (
  props?: Partial<ComponentProps<typeof UpsertRoleNameModal>>,
) => {
  const defaultProps: ComponentProps<
    typeof UpsertRoleNameModal
  > = {
    isOpen: true,
    isLoading: false,
    mode: "rename",
    initialName: "Admins",
    onCancelAction: jest.fn(),
    onConfirmAction: jest.fn(),
  };

  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  return {
    ...render(<UpsertRoleNameModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("UpsertRoleNameModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders edit mode with the description field", () => {
    renderModal();

    expect(
      screen.getByRole("heading", {
        name: /edit role/i,
      }),
    ).toBeInTheDocument();

    expect(mockForm).toHaveBeenCalledWith(
      expect.objectContaining({
        initialName: "Admins",
        submitText: "Save changes",
        // A description can only be edited here — that is the whole point of the mode.
        showDescription: true,
      }),
    );
  });

  it("hides the description field when duplicating", () => {
    renderModal({ mode: "duplicate" });

    expect(mockForm).toHaveBeenCalledWith(
      expect.objectContaining({ showDescription: false }),
    );
  });

  it("renders duplicate mode", () => {
    renderModal({
      mode: "duplicate",
    });

    expect(
      screen.getByRole("heading", {
        name: /duplicate role/i,
      }),
    ).toBeInTheDocument();

    expect(mockForm).toHaveBeenCalledWith(
      expect.objectContaining({
        submitText: "Create duplicate",
      }),
    );
  });

  it("calls confirm action", () => {
    const onConfirmAction = jest.fn();

    renderModal({
      onConfirmAction,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /save changes/i,
      }),
    );

    expect(onConfirmAction).toHaveBeenCalledWith({
      name: "Managers",
    });
  });

  it("calls cancel action", () => {
    const onCancelAction = jest.fn();

    renderModal({
      onCancelAction,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /cancel/i,
      }),
    );

    expect(onCancelAction).toHaveBeenCalled();
  });
});
