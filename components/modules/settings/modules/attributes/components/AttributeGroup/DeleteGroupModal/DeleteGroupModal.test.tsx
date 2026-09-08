import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { DeleteGroupModal } from "./DeleteGroupModal";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";

// The delete modals fetch an impact preview (values / people affected). That needs a QueryClient and
// the app-data context, neither of which belongs in a modal rendering test — stub the hook instead.
const groupImpact = { data: undefined, isLoading: false, error: undefined } as {
  data?: { attributeCount: number; valueCount: number; peopleCount: number };
  isLoading: boolean;
  error?: unknown;
};

jest.mock("@/components/modules/settings/modules/attributes/hooks/useDeleteImpact", () => ({
  useAttributeDeleteImpact: () => ({ data: undefined, isLoading: false, error: undefined }),
  useGroupDeleteImpact: () => groupImpact,
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
    groupImpact.data = undefined;
    groupImpact.isLoading = false;
    groupImpact.error = undefined;
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

  // Three outcomes, not two. Before this the loading state, the failure and a genuinely empty
  // section all rendered the same vague sentence, so the reader could not tell an empty section
  // from an unreachable API before pressing Delete.
  describe("what it says about the impact", () => {
    it("says it is still asking, and will not let Delete be pressed meanwhile", () => {
      groupImpact.isLoading = true;
      renderModal();

      expect(screen.getByText(/checking what this section contains/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /delete section/i })).toBeDisabled();
    });

    it("says the impact is unknown when it could not be read, and still allows the delete", () => {
      groupImpact.error = new Error("boom");
      renderModal();

      expect(
        screen.getByText(/what this section contains is unknown/i),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /delete section/i })).toBeEnabled();
    });

    it("gives the counts when it has them", () => {
      groupImpact.data = { attributeCount: 3, valueCount: 12, peopleCount: 4 };
      renderModal();

      expect(screen.getByText(/attributes? in this section will/i)).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("12")).toBeInTheDocument();
    });

    it("says so plainly when the section is empty", () => {
      groupImpact.data = { attributeCount: 0, valueCount: 0, peopleCount: 0 };
      renderModal();

      expect(screen.getByText(/this section is empty/i)).toBeInTheDocument();
    });
  });
});
