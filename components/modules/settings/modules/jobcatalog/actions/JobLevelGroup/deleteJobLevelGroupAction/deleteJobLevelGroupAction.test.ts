import { ActionStatus } from "@/components/models/ActionStatus";
import { jobLevelGroupService } from "@/api/modules/jobLevelGroup/services/jobLevelGroupService";

jest.mock("next/cache");
jest.mock("@/api/modules/jobLevelGroup/services/jobLevelGroupService");

describe("deleteJobLevelGroupAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  const mockInput: DeleteJobLevelGroupActionInput = {
    id: "test-id",
  };

  it("calls jobLevelGroupService.deleteJobLevelGroup with correct arguments", async () => {
    await deleteJobLevelGroupAction(mockInput);

    expect(jobLevelGroupService.deleteJobLevelGroup).toHaveBeenCalledWith(mockInput);
  });

  it("returns SUCCESS when jobLevelGroupService.deleteJobLevelGroup resolves", async () => {
    (jobLevelGroupService.deleteJobLevelGroup as jest.Mock).mockResolvedValue(
      undefined
    );

    const result = await deleteJobLevelGroupAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
    });
  });

  it("returns ERROR when jobLevelGroupService.deleteJobLevelGroup rejects", async () => {
    (jobLevelGroupService.deleteJobLevelGroup as jest.Mock).mockRejectedValue(
      new Error("Test error")
    );

    const result = await deleteJobLevelGroupAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while deleting Job Level Groups. Please try again.",
    });
  });
});
