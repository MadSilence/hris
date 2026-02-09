import { ActionStatus } from "@/components/models/ActionStatus";
import type { CreateJobLevelItemActionInput } from "";
import { createJobLevelItemAction } from "";
import { jobLevelItemService } from "@/api/modules/jobLevelItem/services/jobLevelItemService";

jest.mock("next/cache");
jest.mock("@/api/modules/jobLevelItem/services/jobLevelItemService");

describe("createJobLevelItemAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  const mockInput: CreateJobLevelItemActionInput = {
    name: "Senior Engineer L3",
  };

  it("calls jobLevelItemService.createJobLevelItem with correct arguments", async () => {
    await createJobLevelItemAction(mockInput);

    expect(jobLevelItemService.createJobLevelItem).toHaveBeenCalledWith(mockInput);
  });

  it("returns SUCCESS and data when jobLevelItemService.createJobLevelItem resolves", async () => {
    (jobLevelItemService.createJobLevelItem as jest.Mock).mockResolvedValue({
      id: 1,
    });

    const result = await createJobLevelItemAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
      data: { id: 1 },
    });
  });

  it("returns ERROR when jobLevelItemService.createJobLevelItem rejects", async () => {
    (jobLevelItemService.createJobLevelItem as jest.Mock).mockRejectedValue(
      new Error("Test error")
    );

    const result = await createJobLevelItemAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while creating a Job Level Item. Please try again.",
    });
  });
});
