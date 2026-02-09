import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import type {
  DeleteJobLevelGroupActionInput
} from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelGroup/deleteJobLevelGroupAction";
import {
  deleteJobLevelGroupAction
} from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelGroup/deleteJobLevelGroupAction";
import { useInvalidateJobLevelGroupQuery } from "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelGroup/useJobLevelGroup";
import {
  useDeleteJobLevelGroupAction
} from "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelGroup/useDeleteJobLevelGroupAction";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/jobcatalog/actions/JobLevelGroup/DeleteJobLevelGroupAction",
  () => ({
    deleteJobLevelGroupAction: jest.fn(),
  })
);

jest.mock(
  "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelGroup/useJobLevelGroup",
  () => ({
    useInvalidateJobLevelGroupQuery: jest.fn(),
  })
);

describe("useDeleteJobLevelGroupAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls deleteJobLevelGroupAction and runs revalidation on success", async () => {
    const mockPayload: DeleteJobLevelGroupActionInput = {
      id: "job-level-group-id",
    };

    const mockRevalidate = jest.fn();

    (useInvalidateJobLevelGroupQuery as jest.Mock).mockReturnValue(
      mockRevalidate
    );
    (deleteJobLevelGroupAction as jest.Mock).mockResolvedValue({
      status: "SUCCESS",
    });

    let capturedOpts: any;
    (useMutation as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;
      return { mutate: jest.fn(), mutateAsync: opts.mutationFn };
    });

    renderHook(() => useDeleteJobLevelGroupAction());

    await act(async () => {
      await capturedOpts.mutationFn(mockPayload);
    });

    expect(deleteJobLevelGroupAction).toHaveBeenCalledWith(mockPayload);

    capturedOpts.onSuccess?.();
    expect(mockRevalidate).toHaveBeenCalled();
  });
});
