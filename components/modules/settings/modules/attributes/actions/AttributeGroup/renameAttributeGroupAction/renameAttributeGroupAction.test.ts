import { groupsService } from "@/api/modules/groups/services/groupsService";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  renameAttributeGroupAction,
  RenameAttributeGroupActionInput
} from "@/components/modules/settings/modules/attributes/actions/AttributeGroup/renameAttributeGroupAction/renameAttributeGroupAction";

jest.mock("next/cache");
jest.mock("/api/modules/groups/services/groupsService/groupsService.ts");

describe("renameAttributeGroupAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  const mockInput: RenameAttributeGroupActionInput = {
    id: "test-id",
    name: "Renamed group",
  };

  it("calls groupsService.renameAttributeGroup with correct arguments", async () => {
    await renameAttributeGroupAction(mockInput);

    expect(groupsService.renameAttributeGroup).toHaveBeenCalledWith(mockInput);
  });

  it("returns SUCCESS and data when groupsService.renameAttributeGroup resolves", async () => {
    (groupsService.renameAttributeGroup as jest.Mock).mockResolvedValue({
      id: "test-id",
      name: "Renamed group",
    });

    const result = await renameAttributeGroupAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
      data: { id: "test-id", name: "Renamed group" },
    });
  });

  it("returns ERROR when groupsService.renameAttributeGroup rejects with an error", async () => {
    (groupsService.renameAttributeGroup as jest.Mock).mockRejectedValue(new Error("Test error"));

    const result = await renameAttributeGroupAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while renaming group. Please try again.",
    });
  });
});
