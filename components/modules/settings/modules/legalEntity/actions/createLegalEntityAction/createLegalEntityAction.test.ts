import type { CreateLegalEntityActionInput } from "@/components/modules/settings/modules/legalEntity/actions/createLegalEntityAction";
import { createLegalEntityAction } from "@/components/modules/settings/modules/legalEntity/actions/createLegalEntityAction";
import { ActionStatus } from "@/components/models/ActionStatus";
import { legalEntityService } from "@/api/modules/legalEntity/services/legalEntityService";

jest.mock("next/cache");

jest.mock("@/api/modules/legalEntity/services/legalEntityService", () => ({
  legalEntityService: {
    createLegalEntity: jest.fn(),
  },
}));

describe("createLegalEntityAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  const mockInput: CreateLegalEntityActionInput = {
    name: "ACME GmbH",
    description: "",
    registrationNumber: "HRB 987654",
    taxId: "DE123456",
    country: "Germany",
    city: "Berlin",
    street: "Unter den Linden",
    building: "10",
    postCode: "10117",
  };

  it("calls legalEntityService.createLegalEntity with correct arguments", async () => {
    await createLegalEntityAction(mockInput);

    expect(legalEntityService.createLegalEntity).toHaveBeenCalledWith(mockInput);
  });

  it("returns SUCCESS and data when legalEntityService.createLegalEntity resolves", async () => {
    (legalEntityService.createLegalEntity as jest.Mock).mockResolvedValue({
      id: "1",
    });

    const result = await createLegalEntityAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
      data: { id: "1" },
    });
  });

  it("returns ERROR when legalEntityService.createLegalEntity rejects", async () => {
    (legalEntityService.createLegalEntity as jest.Mock).mockRejectedValue(
      new Error("Test error"),
    );

    const result = await createLegalEntityAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while creating a legal entity. Please try again.",
    });
  });
});
