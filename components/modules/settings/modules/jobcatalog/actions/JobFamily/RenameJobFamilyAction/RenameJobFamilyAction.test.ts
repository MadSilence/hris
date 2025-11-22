import { ActionStatus } from "@/components/models/ActionStatus";
import { jobFamilyService } from "@/api/modules/jobfamily/services/jobFamilyService";
import type { RenameJobFamilyActionInput } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/RenameJobFamilyAction";
import { renameJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/RenameJobFamilyAction";

jest.mock("next/cache");
jest.mock("@/api/modules/jobfamily/services/jobFamilyService");

describe("renameJobFamilyAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  const mockInput: RenameJobFamilyActionInput = {
    id: "test-id",
    name: "Renamed Job Family",
  };

  it("calls jobFamiliesService.renameJobFamily with correct arguments", async () => {
    await renameJobFamilyAction(mockInput);

    expect(jobFamilyService.renameJobFamily).toHaveBeenCalledWith(mockInput);
  });

  it("returns SUCCESS and data when jobFamiliesService.renameJobFamily resolves", async () => {
    (jobFamilyService.renameJobFamily as jest.Mock).mockResolvedValue({
      id: "test-id",
      name: "Renamed Job Family",
    });

    const result = await renameJobFamilyAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
      data: { id: "test-id", name: "Renamed Job Family" },
    });
  });

  it("returns ERROR when jobFamiliesService.renameJobFamily rejects", async () => {
    (jobFamilyService.renameJobFamily as jest.Mock).mockRejectedValue(
      new Error("Test error")
    );

    const result = await renameJobFamilyAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while renaming job family. Please try again.",
    });
  });
});
