import type {
  UpdateJobLevelItemActionInput,
} from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelItem/updateJobLevelItemAction";
import { updateJobLevelItemAction } from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelItem/updateJobLevelItemAction";
import { ActionStatus } from "@/components/models/ActionStatus";
import { jobLevelItemService } from "@/api/modules/jobLevelItem/services/jobLevelItemService";

jest.mock("next/cache");
jest.mock("@/api/modules/jobLevelItem/services/jobLevelItemService");

describe("updateJobLevelItemAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  const mockInput: UpdateJobLevelItemActionInput = {
    id: "jli-123",
    name: "Senior Engineer L4",
  };

  it("calls jobLevelItemService.updateJobLevelItem with correct arguments", async () => {
    await updateJobLevelItemAction(mockInput);

    expect(jobLevelItemService.updateJobLevelItem)
      .toHaveBeenCalledWith(mockInput);
  });

  it("returns SUCCESS and updated entity when updateJobLevelItem resolves", async () => {
    (jobLevelItemService.updateJobLevelItem as jest.Mock)
      .mockResolvedValue({ id: "jli-123", updated: true });

    const result = await updateJobLevelItemAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
      data: { id: "jli-123", updated: true },
    });
  });

  it("returns ERROR when updateJobLevelItem rejects", async () => {
    (jobLevelItemService.updateJobLevelItem as jest.Mock)
      .mockRejectedValue(new Error("Test error"));

    const result = await updateJobLevelItemAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while updating the Job Level Item. Please try again.",
    });
  });
});
