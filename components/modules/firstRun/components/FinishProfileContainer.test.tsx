import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";

import { ActionStatus } from "@/components/models/ActionStatus";
import type { Attribute } from "@/models/attribute/Attribute";
import { AttributeType } from "@/models/attribute/AttributeType";
import { partialMock } from "@/test/types";
import { FinishProfileContainer } from "./FinishProfileContainer";

const updateUserAttributesAction = jest.fn();
const back = jest.fn();
const push = jest.fn();

jest.mock("sonner", () => ({ toast: { error: jest.fn() } }));
jest.mock("next/navigation", () => ({ useRouter: () => ({ back, push }) }));

jest.mock("@/components/modules/organization/modules/profile/actions/updateUserAttributesAction", () => ({
  updateUserAttributesAction: (...args: unknown[]) => updateUserAttributesAction(...args),
}));

jest.mock("@/components/providers/CurrentUserProvider/CurrentUserProvider", () => ({
  useCurrentUser: () => ({ userId: "user-1" }),
}));

const attribute = (id: string, name: string) =>
  partialMock<Attribute>({ id, name, type: AttributeType.TEXT, isSystem: false, isUnique: false });

jest.mock("@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups", () => ({
  useAttributeGroups: () => ({
    data: [{ attributes: [attribute("nick", "Preferred name"), attribute("phone", "Phone"), attribute("salary", "Salary")] }],
    isLoading: false,
  }),
}));

// Preferred name and Phone are theirs to edit; Phone is filled already. Salary is not theirs.
const welcomeData = {
  fields: [{ id: "attr:nick" }, { id: "attr:phone" }],
  values: { "attr:phone": "+370 600 00000" } as Record<string, unknown>,
  firstName: "Jonas",
  lastName: "Berg",
  avatarUrl: null,
  completed: true,
  outstanding: true,
};
let mockWelcome = welcomeData;

jest.mock("@/components/modules/firstRun/hooks", () => ({
  WELCOME_QK: ["WELCOME"],
  useWelcome: () => ({ data: mockWelcome, error: null }),
}));

jest.mock("@tanstack/react-query", () => ({ useQueryClient: () => ({ invalidateQueries: jest.fn() }) }));

const show = () => render(<FinishProfileContainer company={{ name: "Acme", logoUrl: null }} />);

beforeEach(() => {
  mockWelcome = welcomeData;
  updateUserAttributesAction.mockReset();
  back.mockReset();
  push.mockReset();
  (toast.error as jest.Mock).mockReset();
});

/** profile-finish (P2), read through the real catalogue. */
describe("FinishProfileContainer", () => {
  it("asks only for the blank fields the person may edit, with no stepper", async () => {
    show();

    expect(await screen.findByRole("heading", { name: "Finish your profile" })).toBeInTheDocument();
    expect(screen.getByText("Fill in what’s missing. All of it can wait.")).toBeInTheDocument();
    expect(screen.getByText("Preferred name")).toBeInTheDocument();
    expect(screen.queryByText("Phone")).not.toBeInTheDocument();
    expect(screen.queryByText("Salary")).not.toBeInTheDocument();
    expect(screen.queryByText(/Step \d of/)).not.toBeInTheDocument();
  });

  it("with nothing to finish goes back instead of showing an empty form (walk of 2026-11-19)", async () => {
    mockWelcome = { ...welcomeData, values: { "attr:nick": "Jo", "attr:phone": "+370 600 00000" }, outstanding: false };
    show();

    await waitFor(() => expect(back.mock.calls.length + push.mock.calls.length).toBe(1));
    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
  });

  it("Not now goes back without saving", async () => {
    show();
    fireEvent.click(await screen.findByRole("button", { name: "Not now" }));

    expect(updateUserAttributesAction).not.toHaveBeenCalled();
    expect(back.mock.calls.length + push.mock.calls.length).toBe(1);
  });

  it("Save writes what was filled and goes back", async () => {
    updateUserAttributesAction.mockResolvedValue({ status: ActionStatus.SUCCESS });
    show();
    fireEvent.change(await screen.findByRole("textbox"), { target: { value: "Jo" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(updateUserAttributesAction).toHaveBeenCalledWith({ userId: "user-1", values: { nick: "Jo" } }));
    await waitFor(() => expect(back.mock.calls.length + push.mock.calls.length).toBe(1));
  });

  it("a failed save keeps what was typed and offers Retry", async () => {
    updateUserAttributesAction.mockResolvedValue({ status: ActionStatus.ERROR, errorMessage: "x" });
    show();
    fireEvent.change(await screen.findByRole("textbox"), { target: { value: "Jo" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Couldn’t save. Try again",
      expect.objectContaining({ action: expect.objectContaining({ label: "Retry" }) })));
    expect(screen.getByRole("textbox")).toHaveValue("Jo");
    expect(back).not.toHaveBeenCalled();
  });
});
