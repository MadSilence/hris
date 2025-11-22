import { ActionStatus } from "@/components/models/ActionStatus";
import {
  reorderAttributesAction,
  ReorderAttributesActionInput,
} from "@/components/modules/settings/modules/attributes/actions/Attribute/reorderAttributesAction/reorderAttributesAction";
import { attributeService } from "@/api/modules/attributes/services/attributeService";

jest.mock("next/cache");

jest.mock("@/api/modules/attributes/services/attributeService", () => ({
  attributeService: {
    reorderAttributes: jest.fn(),
  },
}));

describe("reorderAttributesAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  const mockInput: ReorderAttributesActionInput[] = [
    { id: "a", sortOrder: 3 },
    { id: "b", sortOrder: 1 },
  ];

  it("calls attributeService.reorderAttributes with normalized array payload", async () => {
    await reorderAttributesAction(mockInput);

    expect(attributeService.reorderAttributes).toHaveBeenCalledWith([
      { id: "a", sortOrder: 1 },
      { id: "b", sortOrder: 2 },
    ]);
  });

  it("returns SUCCESS when attributeService.reorderAttributes resolves", async () => {
    (attributeService.reorderAttributes as jest.Mock).mockResolvedValueOnce(undefined);

    const result = await reorderAttributesAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
    });
  });

  it("returns ERROR when attributeService.reorderAttributes rejects", async () => {
    (attributeService.reorderAttributes as jest.Mock).mockRejectedValueOnce(new Error("boom"));

    const result = await reorderAttributesAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while reordering attributes. Please try again.",
    });
  });
});
