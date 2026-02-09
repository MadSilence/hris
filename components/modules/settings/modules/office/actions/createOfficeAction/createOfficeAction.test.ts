import type { CreateOfficeActionInput } from "@/components/modules/settings/modules/office/actions/createOfficeAction";
import { createOfficeAction } from "@/components/modules/settings/modules/office/actions/createOfficeAction";
import { ActionStatus } from "@/components/models/ActionStatus";
import { officeService } from "@/api/modules/office/services/officeService";

jest.mock("next/cache");

jest.mock("@/api/modules/office/services/officeService", () => ({
  officeService: {
    createOffice: jest.fn(),
  },
}));

describe("createOfficeAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  const mockInput: CreateOfficeActionInput = {
    name: "Berlin HQ",
    description: "",
    email: "",
    phone: "",
    isSystem: false,
    country: "Germany",
    city: "Berlin",
    street: "Unter den Linden",
    building: "10",
    postCode: "10117",
  };

  it("calls officeService.createOffice with correct arguments", async () => {
    await createOfficeAction(mockInput);

    expect(officeService.createOffice).toHaveBeenCalledWith(mockInput);
  });

  it("returns SUCCESS and data when officeService.createOffice resolves", async () => {
    (officeService.createOffice as jest.Mock).mockResolvedValue({
      id: "1",
    });

    const result = await createOfficeAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
      data: { id: "1" },
    });
  });

  it("returns ERROR when officeService.createOffice rejects", async () => {
    (officeService.createOffice as jest.Mock).mockRejectedValue(
      new Error("Test error"),
    );

    const result = await createOfficeAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while creating an office. Please try again.",
    });
  });
});
