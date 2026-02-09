import { ActionStatus } from "@/components/models/ActionStatus";
import type { CreateJobLevelGroupActionInput } from "";
import { createJobLevelGroupAction } from "";
import { jobLevelGroupService } from "@/api/modules/jobLevelGroup/services/jobLevelGroupService";

jest.mock("next/cache");
jest.mock("@/api/modules/jobLevelGroup/services/jobLevelGroupService");

describe("createJobLevelGroupAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  const mockInput: CreateJobLevelGroupActionInput = {
    name: "Senior Engineering",
  };

  it("calls jobLevelGroupService.createJobLevelGroup with correct arguments", async () => {
    await createJobLevelGroupAction(mockInput);

    expect(jobLevelGroupService.createJobLevelGroup).toHaveBeenCalledWith(mockInput);
  });

  it("returns SUCCESS and data when jobLevelGroupService.createJobLevelGroup resolves", async () => {
    (jobLevelGroupService.createJobLevelGroup as jest.Mock).mockResolvedValue({
      id: 1,
    });

    const result = await createJobLevelGroupAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
      data: { id: 1 },
    });
  });

  it("returns ERROR when jobLevelGroupService.createJobLevelGroup rejects", async () => {
    (jobLevelGroupService.createJobLevelGroup as jest.Mock).mockRejectedValue(
      new Error("Test error")
    );

    const result = await createJobLevelGroupAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while creating a Job Level Group. Please try again.",
    });
  });
});
