import { ActionStatus } from "@/components/models/ActionStatus";
import type { CreateJobFamilyActionInput } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/CreateJobFamilyAction";
import { createJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/CreateJobFamilyAction";
import { jobFamilyService } from "@/api/modules/jobfamily/services/jobFamilyService";

jest.mock("next/cache");
jest.mock("@/api/modules/jobfamily/services/jobFamilyService");

describe("createJobFamilyAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  const mockInput: CreateJobFamilyActionInput = {
    name: "Engineering",
  };

  it("calls jobFamiliesService.createJobFamily with correct arguments", async () => {
    await createJobFamilyAction(mockInput);

    expect(jobFamilyService.createJobFamily).toHaveBeenCalledWith(mockInput);
  });

  it("returns SUCCESS and data when jobFamiliesService.createJobFamily resolves", async () => {
    (jobFamilyService.createJobFamily as jest.Mock).mockResolvedValue({
      id: 1,
    });

    const result = await createJobFamilyAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
      data: { id: 1 },
    });
  });

  it("returns ERROR when jobFamiliesService.createJobFamily rejects", async () => {
    (jobFamilyService.createJobFamily as jest.Mock).mockRejectedValue(
      new Error("Test error")
    );

    const result = await createJobFamilyAction(mockInput);

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while creating a Job Family. Please try again.",
    });
  });
});
