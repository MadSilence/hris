import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  DeleteRoleModal
} from "@/components/modules/settings/modules/roles/components/RolesPageContainer/modules/RolesTable/modals/DeleteRoleModal/DeleteRoleModal";

const renderModal = (
  props?: Partial<ComponentProps<typeof DeleteRoleModal>>,
) => {
  const defaultProps: ComponentProps<typeof DeleteRoleModal> = {
    isOpen: true,
    isLoading: false,
    roleName: "Admin",
    onConfirmAction: jest.fn(),
    onRequestCloseAction: jest.fn(),
  };

  const mergedProps = { ...defaultProps, ...props };

  return {
    ...render(<DeleteRoleModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("DeleteRoleModal", () => {
  afterEach(() => jest.clearAllMocks());

  it("does not render when closed", () => {
    renderModal({ isOpen: false });

    expect(
      screen.queryByRole("heading", { name: /delete role/i }),
    ).not.toBeInTheDocument();
  });

  it("renders role content", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /delete role/i }),
    ).toBeInTheDocument();

    expect(screen.getByText("Admin")).toBeInTheDocument();

    expect(
      screen.getByText(/users assigned to this role may lose access/i),
    ).toBeInTheDocument();
  });

  it("renders fallback role name", () => {
    renderModal({ roleName: undefined });

    expect(screen.getByText(/the selected role/i)).toBeInTheDocument();
  });

  it("calls confirm action", () => {
    const onConfirmAction = jest.fn();

    renderModal({ onConfirmAction });

    fireEvent.click(screen.getByRole("button", { name: /delete role/i }));

    expect(onConfirmAction).toHaveBeenCalledTimes(1);
  });

  it("calls request close action", () => {
    const onRequestCloseAction = jest.fn();

    renderModal({ onRequestCloseAction });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onRequestCloseAction).toHaveBeenCalledTimes(1);
  });

  it("disables actions while loading", () => {
    const onConfirmAction = jest.fn();
    const onRequestCloseAction = jest.fn();

    renderModal({ isLoading: true, onConfirmAction, onRequestCloseAction });

    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /delete role/i })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(screen.getByRole("button", { name: /delete role/i }));

    expect(onConfirmAction).not.toHaveBeenCalled();
    expect(onRequestCloseAction).not.toHaveBeenCalled();
  });
});
