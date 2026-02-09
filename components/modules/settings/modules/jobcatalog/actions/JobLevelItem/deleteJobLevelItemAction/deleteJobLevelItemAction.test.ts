import { ActionStatus } from "@/components/models/ActionStatus";
import { jobLevelItemService } from "@/api/modules/jobLevelItem/services/jobLevelItemService";
import type { DeleteJobLevelItemActionInput } from "";
import { deleteJobLevelItemAction } from "";

jest.mock("next/cache");
jest.mock("@/api/modules/jobLevelItem/services/jobLevelItemService");

describe("deleteJobLevelItemAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  const mockInput: DeleteJobLevelItemActionInput = {
    id: "test-id",
  };

  it("calls jobLevelItemService.deleteJobLevelItem with correct arguments", async () => {
    await deleteJobLevelItemAction(mockInput);

    expect(jobLevelItemService.deleteJobLevelItem).toHaveBeenCalledWith(mockInput);
  });

  it("returns SUCCESS when jobLevelItemService.deleteJobLevelItem resolves", async () => {
    (jobLevelItemService.deleteJobLevelItem as jest.Mock).mockResolvedValue(
      undefined
    );

    const result = await deleteJobLevelItemAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
    });
  });

  it("returns ERROR when jobLevelItemService.deleteJobLevelItem rejects", async () => {
    (jobLevelItemService.deleteJobLevelItem as jest.Mock).mockRejectedValue(
      new Error("Test error")
    );

    const result = await deleteJobLevelItemAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while deleting Job Level Items. Please try again.",
    });
  });
});
