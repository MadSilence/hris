import { groupsService } from "@/api/modules/groups/services/groupsService";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  reorderAttributeGroupAction,
  ReorderAttributeGroupActionInput
} from "@/components/modules/settings/modules/attributes/actions/AttributeGroup/reorderAttributeGroupAction/reorderAttributeGroupAction";

jest.mock("next/cache");
jest.mock("/api/modules/groups/services/groupsService/groupsService.ts");

describe("reorderAttributeGroupAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  const mockInput: ReorderAttributeGroupActionInput[] = [
    { id: "a", sortOrder: 1 },
    { id: "b", sortOrder: 2 },
  ];

  it("calls groupsService.reorderAttributeGroups with correct payload", async () => {
    await reorderAttributeGroupAction(mockInput);

    expect(groupsService.reorderAttributeGroups).toHaveBeenCalledWith({
      sortOrder: [
        { id: "a", sortOrder: 1 },
        { id: "b", sortOrder: 2 },
      ],
    });
  });

  it("returns SUCCESS when groupsService.reorderAttributeGroups resolves", async () => {
    (groupsService.reorderAttributeGroups as jest.Mock).mockResolvedValue(undefined);

    const result = await reorderAttributeGroupAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
    });
  });

  it("returns ERROR when groupsService.reorderAttributeGroups rejects with error", async () => {
    (groupsService.reorderAttributeGroups as jest.Mock).mockRejectedValue(
      new Error("Test error"),
    );

    const result = await reorderAttributeGroupAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while reordering groups. Please try again.",
    });
  });
});
