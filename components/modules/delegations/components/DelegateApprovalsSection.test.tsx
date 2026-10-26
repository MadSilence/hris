import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import { DelegateApprovalsSection } from "./DelegateApprovalsSection";
import type { DelegationsDTO } from "@/api/modules/delegations/dto";

const createMutate = jest.fn();
const deleteMutate = jest.fn();
const updateUserSettingsAction = jest.fn();

const delegations: DelegationsDTO = {
  defaultDelegate: { id: "carl", name: "Carl Chief" },
  given: [
    {
      id: "d1",
      delegator: { id: "me", name: "Anna Approver" },
      delegate: { id: "maria", name: "Maria Delegate" },
      startDate: "2026-11-02",
      endDate: "2026-11-06",
      source: "LEAVE",
      sourceRequestId: "leave-1",
      active: false,
    },
  ],
  received: [],
};

jest.mock("@/components/modules/delegations/hooks", () => ({
  useDelegations: () => ({ data: delegations, isLoading: false, error: null, refetch: jest.fn() }),
  useCreateDelegation: () => ({ mutateAsync: createMutate, isPending: false }),
  useDeleteDelegation: () => ({ mutateAsync: deleteMutate, isPending: false }),
}));

jest.mock("@/components/modules/firstRun/actions", () => ({
  updateUserSettingsAction: (...args: unknown[]) => updateUserSettingsAction(...args),
}));

jest.mock("@/components/modules/firstRun/hooks", () => ({
  USER_SETTINGS_QK: ["USER_SETTINGS"],
  useUserSettings: () => ({ data: { delegateApprovalsOnLeave: true }, isLoading: false }),
}));

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));

jest.mock("@/lib/errors/errorToast", () => ({ showActionError: jest.fn() }));

type PickerProps = { value: { id: string; firstName?: string | null } | null; onChange: (u: { id: string } | null) => void };
jest.mock("@/components/modules/settings/shared/UserPickerField/UserPickerField", () => ({
  UserPickerField: ({ value, onChange }: PickerProps) => (
    <button type="button" data-test="delegate-picker" onClick={() => onChange({ id: "maria" })}>
      {value ? `picked ${value.id}` : "nobody"}
    </button>
  ),
}));

type RangeProps = { onChange: (v: { start: string; end: string } | null) => void };
jest.mock("@/components/ui/DatePicker", () => ({
  DateRangePicker: ({ onChange }: RangeProps) => (
    <button type="button" data-test="range" onClick={() => onChange({ start: "2026-12-01", end: "2026-12-05" })}>
      pick
    </button>
  ),
}));

beforeEach(() => {
  createMutate.mockReset().mockResolvedValue({ status: "SUCCESS" });
  deleteMutate.mockReset().mockResolvedValue({ status: "SUCCESS" });
  updateUserSettingsAction.mockReset().mockResolvedValue({ status: "SUCCESS" });
});

describe("DelegateApprovalsSection", () => {
  it("lists the delegations given, saying which follow a leave", () => {
    render(<DelegateApprovalsSection />);

    expect(screen.getByText("Maria Delegate")).toBeInTheDocument();
    expect(screen.getByText(/For your leave/)).toBeInTheDocument();
  });

  it("proposes the person's manager, and adds a delegation for the dates chosen", async () => {
    render(<DelegateApprovalsSection />);

    fireEvent.click(screen.getByRole("button", { name: /Add Delegation/ }));
    expect(screen.getByTestId("delegate-picker")).toHaveTextContent("picked carl");

    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(await screen.findByText("Choose the days the delegation covers.")).toBeInTheDocument();
    expect(createMutate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("range"));
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() =>
      expect(createMutate).toHaveBeenCalledWith({
        delegateUserId: "carl",
        startDate: "2026-12-01",
        endDate: "2026-12-05",
      }),
    );
  });

  it("switches off delegating while on leave", async () => {
    render(<DelegateApprovalsSection />);

    fireEvent.click(screen.getByRole("switch"));

    await waitFor(() => expect(updateUserSettingsAction).toHaveBeenCalledWith({ delegateApprovalsOnLeave: false }));
  });

  it("asks before removing a delegation", async () => {
    render(<DelegateApprovalsSection />);

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(deleteMutate).not.toHaveBeenCalled();
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Remove" }));

    await waitFor(() => expect(deleteMutate).toHaveBeenCalledWith("d1"));
  });
});
