import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { DeleteGroupModal } from "./DeleteGroupModal";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";

// The delete modals fetch an impact preview (values / people affected). That needs a QueryClient and
// the app-data context, neither of which belongs in a modal rendering test — stub the hook instead.
jest.mock("@/components/modules/settings/modules/attributes/hooks/useDeleteImpact", () => ({
  useAttributeDeleteImpact: () => ({ data: undefined }),
  useGroupDeleteImpact: () => ({ data: undefined }),
}));

const mockGroup: AttributeGroup = {
  id: "g1",
  name: "HR",
  isSystem: false,
  sortOrder: 1,
  createdAt: "",
  createdBy: "",
  updatedAt: "",
  attributes: [],
};

const renderModal = (
  props?: Partial<ComponentProps<typeof DeleteGroupModal>>,
) => {
  const defaultProps: ComponentProps<typeof DeleteGroupModal> = {
    isOpen: true,
    isLoading: false,
    onConfirmAction: jest.fn(),
    onRequestCloseAction: jest.fn(),
    group: mockGroup,
  };

  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  return {
    ...render(<DeleteGroupModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("DeleteGroupModal", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    renderModal({ isOpen: false });

    expect(
      screen.queryByRole("heading", { name: /delete section/i }),
    ).not.toBeInTheDocument();
  });

  it("renders delete section content", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /delete section/i }),
    ).toBeInTheDocument();

    expect(screen.getByText("HR")).toBeInTheDocument();

    expect(
      screen.getByText((content) =>
        content.includes("This action cannot be undone"),
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /all attributes assigned to this section will also be deleted/i,
      ),
    ).toBeInTheDocument();

    // The warning now talks about what happens to references, not about "employee data".
    expect(
      screen.getByText(/saved views or filters referencing them will be updated/i),
    ).toBeInTheDocument();
  });

  it("calls confirm action when Delete section is clicked", () => {
    const onConfirmAction = jest.fn();

    renderModal({ onConfirmAction });

    fireEvent.click(screen.getByRole("button", { name: /delete section/i }));

    expect(onConfirmAction).toHaveBeenCalledTimes(1);
  });

  it("calls request close action when Cancel is clicked", () => {
    const onRequestCloseAction = jest.fn();

    renderModal({ onRequestCloseAction });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onRequestCloseAction).toHaveBeenCalledTimes(1);
  });

  it("disables actions while loading", () => {
    const onConfirmAction = jest.fn();
    const onRequestCloseAction = jest.fn();

    renderModal({
      isLoading: true,
      onConfirmAction,
      onRequestCloseAction,
    });

    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /delete section/i }),
    ).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(screen.getByRole("button", { name: /delete section/i }));

    expect(onConfirmAction).not.toHaveBeenCalled();
    expect(onRequestCloseAction).not.toHaveBeenCalled();
  });
});
