import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import {
  useUpdateJobLevelGroupAction
} from "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelGroup/useUpdateJobLevelGroupAction";
import { useInvalidateJobLevelGroupQuery } from "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelGroup/useJobLevelGroup";
import type {
  UpdateJobLevelGroupActionInput,
} from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelGroup/updateJobLevelGroupAction";
import {
  updateJobLevelGroupAction,
} from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelGroup/updateJobLevelGroupAction";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/jobcatalog/actions/JobLevelGroup/updateJobLevelGroupAction",
  () => ({
    updateJobLevelGroupAction: jest.fn(),
  })
);

jest.mock(
  "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelGroup/useJobLevelGroup",
  () => ({
    useInvalidateJobLevelGroupQuery: jest.fn(),
  })
);

describe("useUpdateJobLevelGroupAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls updateJobLevelGroupAction and runs revalidation on success", async () => {
    const mockPayload: UpdateJobLevelGroupActionInput = {
      id: "job-level-group-id",
      name: "Updated group",
    };

    const mockRevalidate = jest.fn();

    (useInvalidateJobLevelGroupQuery as jest.Mock).mockReturnValue(
      mockRevalidate
    );
    (updateJobLevelGroupAction as jest.Mock).mockResolvedValue({
      status: "SUCCESS",
    });

    let capturedOpts: any;
    (useMutation as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;
      return { mutate: jest.fn(), mutateAsync: opts.mutationFn };
    });

    renderHook(() => useUpdateJobLevelGroupAction());

    await act(async () => {
      await capturedOpts.mutationFn(mockPayload);
    });

    expect(updateJobLevelGroupAction).toHaveBeenCalledWith(mockPayload);

    capturedOpts.onSuccess?.();
    expect(mockRevalidate).toHaveBeenCalled();
  });
});
