import type { DeleteLegalEntityActionInput } from "@/components/modules/settings/modules/legalEntity/actions/deleteLegalEntityAction";
import { deleteLegalEntityAction } from "@/components/modules/settings/modules/legalEntity/actions/deleteLegalEntityAction";
import { ActionStatus } from "@/components/models/ActionStatus";
import { legalEntityService } from "@/api/modules/legalEntity/services/legalEntityService";

jest.mock("next/cache");
jest.mock("@/api/modules/legalEntity/services/legalEntityService");

describe("deleteLegalEntityAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  const mockInput: DeleteLegalEntityActionInput = {
    id: "entity-123",
  };

  it("calls legalEntityService.deleteLegalEntity with correct arguments", async () => {
    await deleteLegalEntityAction(mockInput);

    expect(legalEntityService.deleteLegalEntity)
      .toHaveBeenCalledWith(mockInput);
  });

  it("returns SUCCESS when deleteLegalEntity resolves", async () => {
    (legalEntityService.deleteLegalEntity as jest.Mock)
      .mockResolvedValue(undefined);

    const result = await deleteLegalEntityAction(mockInput);

    expect(result).toEqual({ status: ActionStatus.SUCCESS });
  });

  it("returns ERROR when deleteLegalEntity rejects", async () => {
    (legalEntityService.deleteLegalEntity as jest.Mock)
      .mockRejectedValue(new Error("Test error"));

    const result = await deleteLegalEntityAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while deleting the legal entity. Please try again.",
    });
  });
});
