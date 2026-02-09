import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import type {
  DeleteJobLevelItemActionInput
} from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelItem/deleteJobLevelItemAction";
import { deleteJobLevelItemAction } from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelItem/deleteJobLevelItemAction";
import {
  useDeleteJobLevelItemAction
} from "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelItem/useDeleteJobLevelItemAction";
import {
  useInvalidateJobLevelItemQuery
} from "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelItem/useJobLevelItem/useJobLevelItem";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/jobcatalog/actions/JobLevelItem/DeleteJobLevelItemAction",
  () => ({
    deleteJobLevelItemAction: jest.fn(),
  })
);

jest.mock(
  "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelItem/useJobLevelItem",
  () => ({
    useInvalidateJobLevelItemQuery: jest.fn(),
  })
);

describe("useDeleteJobLevelItemAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls deleteJobLevelItemAction and runs revalidation on success", async () => {
    const mockPayload: DeleteJobLevelItemActionInput = {
      id: "job-level-item-id",
    };

    const mockRevalidate = jest.fn();

    (useInvalidateJobLevelItemQuery as jest.Mock).mockReturnValue(
      mockRevalidate
    );
    (deleteJobLevelItemAction as jest.Mock).mockResolvedValue({
      status: "SUCCESS",
    });

    let capturedOpts: any;
    (useMutation as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;
      return { mutate: jest.fn(), mutateAsync: opts.mutationFn };
    });

    renderHook(() => useDeleteJobLevelItemAction());

    await act(async () => {
      await capturedOpts.mutationFn(mockPayload);
    });

    expect(deleteJobLevelItemAction).toHaveBeenCalledWith(mockPayload);

    capturedOpts.onSuccess?.();
    expect(mockRevalidate).toHaveBeenCalled();
  });
});
