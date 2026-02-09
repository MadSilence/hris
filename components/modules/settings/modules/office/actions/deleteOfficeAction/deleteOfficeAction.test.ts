import type { DeleteOfficeActionInput } from "@/components/modules/settings/modules/office/actions/deleteOfficeAction";
import { deleteOfficeAction } from "@/components/modules/settings/modules/office/actions/deleteOfficeAction";
import { ActionStatus } from "@/components/models/ActionStatus";
import { officeService } from "@/api/modules/office/services/officeService";

jest.mock("next/cache");

jest.mock("@/api/modules/office/services/officeService", () => ({
  officeService: {
    deleteOffice: jest.fn(),
  },
}));

describe("deleteOfficeAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  const mockInput: DeleteOfficeActionInput = {
    id: "office-123",
  };

  it("calls officeService.deleteOffice with correct arguments", async () => {
    await deleteOfficeAction(mockInput);

    expect(officeService.deleteOffice).toHaveBeenCalledWith(mockInput);
  });

  it("returns SUCCESS when deleteOffice resolves", async () => {
    (officeService.deleteOffice as jest.Mock).mockResolvedValue(undefined);

    const result = await deleteOfficeAction(mockInput);

    expect(result).toEqual({ status: ActionStatus.SUCCESS });
  });

  it("returns ERROR when deleteOffice rejects", async () => {
    (officeService.deleteOffice as jest.Mock).mockRejectedValue(
      new Error("Test error")
    );

    const result = await deleteOfficeAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while deleting the office. Please try again.",
    });
  });
});
