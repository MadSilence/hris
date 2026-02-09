import type {
  UpdateJobLevelGroupActionInput
} from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelGroup/updateJobLevelGroupAction";
import {
  updateJobLevelGroupAction
} from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelGroup/updateJobLevelGroupAction";
import { ActionStatus } from "@/components/models/ActionStatus";
import { jobLevelGroupService } from "@/api/modules/jobLevelGroup/services/jobLevelGroupService";

jest.mock("next/cache");
jest.mock("@/api/modules/jobLevelGroup/services/jobLevelGroupService");

describe("updateJobLevelGroupAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  const mockInput: UpdateJobLevelGroupActionInput = {
    id: "jlg-123",
    name: "Engineering Levels Updated",
  };

  it("calls jobLevelGroupService.updateJobLevelGroup with correct arguments", async () => {
    await updateJobLevelGroupAction(mockInput);

    expect(jobLevelGroupService.updateJobLevelGroup)
      .toHaveBeenCalledWith(mockInput);
  });

  it("returns SUCCESS and updated entity when updateJobLevelGroup resolves", async () => {
    (jobLevelGroupService.updateJobLevelGroup as jest.Mock)
      .mockResolvedValue({ id: "jlg-123", updated: true });

    const result = await updateJobLevelGroupAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
      data: { id: "jlg-123", updated: true },
    });
  });

  it("returns ERROR when updateJobLevelGroup rejects", async () => {
    (jobLevelGroupService.updateJobLevelGroup as jest.Mock)
      .mockRejectedValue(new Error("Test error"));

    const result = await updateJobLevelGroupAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while updating the Job Level Group. Please try again.",
    });
  });
});
