import type { UpdateLegalEntityActionInput, } from "@/components/modules/settings/modules/legalEntity/actions/updateLegalEntityAction";
import { updateLegalEntityAction } from "@/components/modules/settings/modules/legalEntity/actions/updateLegalEntityAction";
import { ActionStatus } from "@/components/models/ActionStatus";
import { legalEntityService } from "@/api/modules/legalEntity/services/legalEntityService";

jest.mock("next/cache");
jest.mock("@/api/modules/legalEntity/services/legalEntityService");

describe("updateLegalEntityAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  const mockInput: UpdateLegalEntityActionInput = {
    id: "entity-123",
    name: "ACME Updated",
    description: "",
    registrationNumber: "HRB987",
    taxId: "DE987",
    isSystem: true,
    country: "Germany",
    city: "Berlin",
    street: "Teststrasse",
    building: "5",
    postCode: "10117",
  };

  it("calls legalEntityService.updateLegalEntity with correct arguments", async () => {
    await updateLegalEntityAction(mockInput);

    expect(legalEntityService.updateLegalEntity)
      .toHaveBeenCalledWith(mockInput);
  });

  it("returns SUCCESS and updated entity when updateLegalEntity resolves", async () => {
    (legalEntityService.updateLegalEntity as jest.Mock)
      .mockResolvedValue({ id: "entity-123", updated: true });

    const result = await updateLegalEntityAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
      data: { id: "entity-123", updated: true },
    });
  });

  it("returns ERROR when updateLegalEntity rejects", async () => {
    (legalEntityService.updateLegalEntity as jest.Mock)
      .mockRejectedValue(new Error("Test error"));

    const result = await updateLegalEntityAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while updating the legal entity. Please try again.",
    });
  });
});
