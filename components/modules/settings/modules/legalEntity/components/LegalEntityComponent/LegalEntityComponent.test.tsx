import { fireEvent, render, screen } from "@testing-library/react";

import { LegalEntityComponent } from "./LegalEntityComponent";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useCreateLegalEntityAction } from "@/components/modules/settings/modules/legalEntity/hooks/useCreateLegalEntityAction";

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("@/components/modules/settings/modules/legalEntity/hooks/useCreateLegalEntityAction");
jest.mock("@/components/auth/PermissionGate", () => ({
  PermissionGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// A stand-in for the dialog: this test is about which state the screen puts it in, not about the
// form inside it.
jest.mock("../modals/CreateLegalEntityModal", () => ({
  CreateLegalEntityModal: ({
    isOpen,
    errorMessage,
    fieldErrors,
  }: {
    isOpen: boolean;
    errorMessage?: string | null;
    fieldErrors?: Record<string, string> | null;
  }) =>
    isOpen ? (
      <div data-test="create-modal">
        {errorMessage && <span data-test="modal-error">{errorMessage}</span>}
        {fieldErrors && <span data-test="modal-field-errors">{JSON.stringify(fieldErrors)}</span>}
      </div>
    ) : null,
}));

const mockAction = (data?: unknown) =>
  (useCreateLegalEntityAction as jest.Mock).mockReturnValue({
    mutate: jest.fn(),
    reset: jest.fn(),
    isPending: false,
    data,
  });

const renderScreen = () =>
  render(<LegalEntityComponent initialEntities={[]} isLoading={false}/>);

const openCreate = () =>
  // The toolbar button, anchored: with an empty list the empty state is a second, deliberate
  // "Add Legal Entity" affordance, and an unanchored name now matches both.
  fireEvent.click(screen.getByRole("button", { name: /^add legal entity$/i }));

/**
 * A server action answers 200 whether it worked or not — the envelope is the only thing that says
 * no. This screen used to close the dialog on SUCCESS **and** on ERROR and read `errorMessage`
 * nowhere, so a refused create was indistinguishable from a create that worked: the dialog shut,
 * the list did not change, and the network tab said 200.
 */
describe("LegalEntityComponent — a refused create", () => {
  beforeEach(() => jest.clearAllMocks());

  it("keeps the dialog open and hands it the reason", () => {
    mockAction();
    const { rerender } = renderScreen();

    openCreate();
    expect(screen.getByTestId("create-modal")).toBeInTheDocument();

    mockAction({
      status: ActionStatus.ERROR,
      errorMessage: "Some of the details are not valid.",
      fieldErrors: { building: "must not be blank" },
    });
    rerender(<LegalEntityComponent initialEntities={[]} isLoading={false}/>);

    expect(screen.getByTestId("create-modal")).toBeInTheDocument();
    expect(screen.getByTestId("modal-error")).toHaveTextContent(
      "Some of the details are not valid."
    );
    expect(screen.getByTestId("modal-field-errors")).toHaveTextContent("must not be blank");
  });

  it("closes the dialog once the create succeeds", () => {
    mockAction();
    const { rerender } = renderScreen();

    openCreate();
    expect(screen.getByTestId("create-modal")).toBeInTheDocument();

    mockAction({ status: ActionStatus.SUCCESS, data: { id: "le1" } });
    rerender(<LegalEntityComponent initialEntities={[]} isLoading={false}/>);

    expect(screen.queryByTestId("create-modal")).not.toBeInTheDocument();
  });
});
