import type { UpdateOfficeActionInput } from "@/components/modules/settings/modules/office/actions/updateOfficeAction";
import { updateOfficeAction } from "@/components/modules/settings/modules/office/actions/updateOfficeAction";
import { ActionStatus } from "@/components/models/ActionStatus";
import { officeService } from "@/api/modules/office/services/officeService";

jest.mock("next/cache");

jest.mock("@/api/modules/office/services/officeService", () => ({
  officeService: {
    updateOffice: jest.fn(),
  },
}));

describe("updateOfficeAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  const mockInput: UpdateOfficeActionInput = {
    id: "office-123",
    name: "Berlin HQ Updated",
    description: "",
    email: "",
    phone: "",
    isSystem: false,
    country: "Germany",
    city: "Berlin",
    street: "Teststrasse",
    building: "5",
    postCode: "10117",
  };

  it("calls officeService.updateOffice with correct arguments", async () => {
    await updateOfficeAction(mockInput);

    expect(officeService.updateOffice).toHaveBeenCalledWith(mockInput);
  });

  it("returns SUCCESS and updated entity when updateOffice resolves", async () => {
    (officeService.updateOffice as jest.Mock).mockResolvedValue({
      id: "office-123",
      updated: true,
    });

    const result = await updateOfficeAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
      data: { id: "office-123", updated: true },
    });
  });

  it("returns ERROR when updateOffice rejects", async () => {
    (officeService.updateOffice as jest.Mock).mockRejectedValue(
      new Error("Test error"),
    );

    const result = await updateOfficeAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while updating the office. Please try again.",
    });
  });
});
