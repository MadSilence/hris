import { ActionStatus } from "@/components/models/ActionStatus";
import { updateUserAttributesAction } from "./updateUserAttributesAction";
import { hrisApiUsersService } from "@/api/modules/users/services/hrisUsersService";

jest.mock("@/api/modules/users/services/hrisUsersService");

describe("updateUserAttributesAction", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  it("passes the userId and the values through untouched", async () => {
    // The action is a pass-through on purpose: which values are sent is the container's decision,
    // and the server is what validates them. Anything filtered here would be filtered twice.
    const values = { "attr-1": "Berlin", "attr-2": ["opt-a", "opt-b"], "attr-3": null };

    await updateUserAttributesAction({ userId: "user-1", values });

    expect(hrisApiUsersService.updateUserAttributes).toHaveBeenCalledWith("user-1", values);
  });

  it("returns SUCCESS when the service resolves", async () => {
    (hrisApiUsersService.updateUserAttributes as jest.Mock).mockResolvedValue(undefined);

    const result = await updateUserAttributesAction({ userId: "user-1", values: {} });

    expect(result).toEqual({ status: ActionStatus.SUCCESS });
  });

  it("returns ERROR rather than throwing when the service rejects", async () => {
    // Actions never throw to the UI — the envelope is the contract every caller reads.
    (hrisApiUsersService.updateUserAttributes as jest.Mock).mockRejectedValue(
      new Error("Test error")
    );

    const result = await updateUserAttributesAction({ userId: "user-1", values: { a: 1 } });

    expect(result.status).toBe(ActionStatus.ERROR);
    expect(result.errorMessage).toBeTruthy();
  });
});
