import { ActionStatus } from "@/components/models/ActionStatus";
import {
  deleteAttributeAction,
  DeleteAttributeActionInput,
} from "@/components/modules/settings/modules/attributes/actions/Attribute/deleteAttributeAction/deleteAttributeAction";
import { attributeService } from "@/api/modules/attributes/services/attributeService";

jest.mock("next/cache");
jest.mock("/api/modules/attributes/services/attributeService");

describe("deleteAttributeAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  const mockInput: DeleteAttributeActionInput = {
    id: "attr-123",
  };

  it("calls attributeService.deleteAttribute with correct arguments", async () => {
    await deleteAttributeAction(mockInput);

    expect(attributeService.deleteAttribute).toHaveBeenCalledWith(mockInput);
  });

  it("returns SUCCESS when attributeService.deleteAttribute resolves", async () => {
    (attributeService.deleteAttribute as jest.Mock).mockResolvedValue(undefined);

    const result = await deleteAttributeAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
    });
  });

  it("returns ERROR when attributeService.deleteAttribute rejects", async () => {
    (attributeService.deleteAttribute as jest.Mock).mockRejectedValue(new Error("Test error"));

    const result = await deleteAttributeAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while deleting the attribute. Please try again.",
    });
  });
});
