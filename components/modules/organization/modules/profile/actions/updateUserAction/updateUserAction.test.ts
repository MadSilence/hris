import { ActionStatus } from "@/components/models/ActionStatus";
import { updateUserAction } from "./updateUserAction";
import { hrisApiUsersService } from "@/api/modules/users/services/hrisUsersService";

jest.mock("@/api/modules/users/services/hrisUsersService");

describe("updateUserAction", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    (hrisApiUsersService.patchUser as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  it("sends everything in one PATCH — no second call for the manager, job, office or entity", async () => {
    // It used to be up to five calls, one after another, with no transaction: a refusal on the
    // fourth left the first three written.
    const result = await updateUserAction({
      userId: "user-1",
      version: 7,
      firstName: "Ada",
      managerId: "m-1",
      jobId: "j-1",
      officeId: "o-1",
      legalEntityId: "le-1",
      attributes: { "attr-1": "Berlin" },
    });

    expect(result).toEqual({ status: ActionStatus.SUCCESS });
    expect(hrisApiUsersService.patchUser).toHaveBeenCalledTimes(1);
    expect(hrisApiUsersService.patchUser).toHaveBeenCalledWith("user-1", {
      version: 7,
      firstName: "Ada",
      managerId: "m-1",
      jobId: "j-1",
      officeId: "o-1",
      legalEntityId: "le-1",
      attributes: { "attr-1": "Berlin" },
    });
    expect(hrisApiUsersService.setManager).not.toHaveBeenCalled();
  });

  it("turns a null reference into a named clear, and leaves an untouched one out", async () => {
    // A null in a partial patch means "leave it alone" on the server, so clearing is said by name.
    await updateUserAction({ userId: "user-1", managerId: null, officeId: null, jobId: undefined });

    expect(hrisApiUsersService.patchUser).toHaveBeenCalledWith("user-1", {
      clear: ["managerId", "officeId"],
    });
  });

  it("does not send an empty attributes map", async () => {
    await updateUserAction({ userId: "user-1", lastName: "Byron", attributes: {} });

    expect(hrisApiUsersService.patchUser).toHaveBeenCalledWith("user-1", { lastName: "Byron" });
  });

  it("keeps a cleared custom value as null", async () => {
    await updateUserAction({ userId: "user-1", attributes: { "attr-1": null } });

    expect(hrisApiUsersService.patchUser).toHaveBeenCalledWith("user-1", {
      attributes: { "attr-1": null },
    });
  });

  it("returns ERROR rather than throwing when the patch is refused", async () => {
    (hrisApiUsersService.patchUser as jest.Mock).mockRejectedValue(new Error("Refused"));

    const result = await updateUserAction({ userId: "user-1", email: "x@example.com" });

    expect(result.status).toBe(ActionStatus.ERROR);
    expect(result.errorMessage).toBeTruthy();
  });
});
