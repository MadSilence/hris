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

  it("renders rename mode", () => {
    renderModal();

    expect(
      screen.getByRole("heading", {
        name: /rename role/i,
      }),
    ).toBeInTheDocument();

    expect(mockForm).toHaveBeenCalledWith(
      expect.objectContaining({
        initialName: "Admins",
        submitText: "Save changes",
      }),
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
