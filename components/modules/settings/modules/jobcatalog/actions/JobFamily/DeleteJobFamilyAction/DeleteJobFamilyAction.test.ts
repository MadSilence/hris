import { ActionStatus } from "@/components/models/ActionStatus";
import { jobFamilyService } from "@/api/modules/jobfamily/services/jobFamilyService";
import type { DeleteJobFamilyActionInput } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/DeleteJobFamilyAction";
import { deleteJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/DeleteJobFamilyAction";

jest.mock("next/cache");
jest.mock("@/api/modules/jobfamily/services/jobFamilyService");

describe("deleteJobFamilyAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  const mockInput: DeleteJobFamilyActionInput = {
    id: "test-id",
  };

  it("calls jobFamiliesService.deleteJobFamily with correct arguments", async () => {
    await deleteJobFamilyAction(mockInput);

    expect(jobFamilyService.deleteJobFamily).toHaveBeenCalledWith(mockInput);
  });

  it("returns SUCCESS when jobFamiliesService.deleteJobFamily resolves", async () => {
    (jobFamilyService.deleteJobFamily as jest.Mock).mockResolvedValue(
      undefined
    );

    const result = await deleteJobFamilyAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
    });
  });

  it("returns ERROR when jobFamiliesService.deleteJobFamily rejects", async () => {
    (jobFamilyService.deleteJobFamily as jest.Mock).mockRejectedValue(
      new Error("Test error")
    );

    const result = await deleteJobFamilyAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while deleting job families. Please try again.",
    });
  });
});
