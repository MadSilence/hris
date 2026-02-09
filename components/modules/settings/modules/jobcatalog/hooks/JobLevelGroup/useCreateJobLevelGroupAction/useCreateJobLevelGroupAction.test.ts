import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import { useCreateJobLevelGroupAction } from "./useCreateJobLevelGroupAction";
import type {
  CreateJobLevelGroupActionInput
} from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelGroup/createJobLevelGroupAction";
import {
  createJobLevelGroupAction
} from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelGroup/createJobLevelGroupAction";
import { useInvalidateJobLevelGroupQuery } from "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelGroup/useJobLevelGroup";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/jobcatalog/actions/JobLevelGroup/CreateJobLevelGroupAction",
  () => ({
    createJobLevelGroupAction: jest.fn(),
  })
);

jest.mock(
  "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelItem/useJobLevelItem",
  () => ({
    useInvalidateJobLevelGroupQuery: jest.fn(),
  })
);

describe("useCreateJobLevelGroupAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls createJobLevelGroupAction and runs revalidation on success", async () => {
    const mockPayload: CreateJobLevelGroupActionInput = { name: "Engineering Levels" };
    const mockRevalidate = jest.fn();

    (useInvalidateJobLevelGroupQuery as jest.Mock).mockReturnValue(
      mockRevalidate
    );
    (createJobLevelGroupAction as jest.Mock).mockResolvedValue({ id: "1" });

    let capturedOpts: any;
    (useMutation as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;
      return { mutate: jest.fn(), mutateAsync: opts.mutationFn };
    });

    renderHook(() => useCreateJobLevelGroupAction());

    await act(async () => {
      await capturedOpts.mutationFn(mockPayload);
    });

    expect(createJobLevelGroupAction).toHaveBeenCalledWith(mockPayload);

    capturedOpts.onSuccess?.();
    expect(mockRevalidate).toHaveBeenCalled();
  });
});
