import type {
  CreateAttributeGroupActionInput
} from "@/components/modules/settings/modules/attributes/actions/AttributeGroup/createAttributeGroupAction";
import { createAttributeGroupAction } from "@/components/modules/settings/modules/attributes/actions/AttributeGroup/createAttributeGroupAction";
import { groupsService } from "@/api/modules/groups/services/groupsService";
import { ActionStatus } from "@/components/models/ActionStatus";

jest.mock("next/cache");
jest.mock("@/api/modules/groups/services/groupsService", () => ({
  groupsService: {
    createGroup: jest.fn(),
  },
}));

describe("createAttributeGroupAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  const mockInput: CreateAttributeGroupActionInput = {
    name: "Test name",
    description: "Test description",
  };

  it("calls groupsService.createGroup with correct arguments", async () => {
    await createAttributeGroupAction(mockInput);

    expect(groupsService.createGroup).toHaveBeenCalledWith(mockInput);
  });

  it("returns correct output when groupsService.createGroup resolves successfully", async () => {
    (groupsService.createGroup as jest.Mock).mockResolvedValue({ id: 1 });

    const result = await createAttributeGroupAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
      data: { id: 1 },
    });
  });

  it("returns correct output when groupsService.createGroup rejects with an error", async () => {
    (groupsService.createGroup as jest.Mock).mockRejectedValue(new Error("Test error"));

    const result = await createAttributeGroupAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred. Please try again.",
    });
  });
})
