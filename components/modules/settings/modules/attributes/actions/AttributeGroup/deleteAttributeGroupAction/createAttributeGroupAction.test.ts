import { groupsService } from "@/api/modules/groups/services/groupsService";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  deleteAttributeGroupAction,
  DeleteAttributeGroupActionInput
} from "@/components/modules/settings/modules/attributes/actions/AttributeGroup/deleteAttributeGroupAction";

jest.mock("next/cache");
jest.mock("/api/modules/groups/services/groupsService");

describe("deleteAttributeGroupAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  const mockInput: DeleteAttributeGroupActionInput = {
    id: "test-id",
  };

  it("calls groupsService.deleteAttributeGroup with correct arguments", async () => {
    await deleteAttributeGroupAction(mockInput);

    expect(groupsService.deleteAttributeGroup).toHaveBeenCalledWith(mockInput);
  });

  it("returns SUCCESS when groupsService.deleteAttributeGroup resolves successfully", async () => {
    (groupsService.deleteAttributeGroup as jest.Mock).mockResolvedValue(undefined);

    const result = await deleteAttributeGroupAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
    });
  });

  it("returns ERROR when groupsService.deleteAttributeGroup rejects with an error", async () => {
    (groupsService.deleteAttributeGroup as jest.Mock).mockRejectedValue(new Error("Test error"));

    const result = await deleteAttributeGroupAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while deleting groups. Please try again.",
    });
  });
});
