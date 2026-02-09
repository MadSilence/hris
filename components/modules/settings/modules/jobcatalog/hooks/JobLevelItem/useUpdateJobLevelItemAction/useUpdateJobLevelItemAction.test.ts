import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import {
  useUpdateJobLevelItemAction
} from "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelItem/useUpdateJobLevelItemAction";
import type {
  UpdateJobLevelItemActionInput,
} from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelItem/updateJobLevelItemAction";
import { updateJobLevelItemAction, } from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelItem/updateJobLevelItemAction";
import {
  useInvalidateJobLevelItemQuery
} from "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelItem/useJobLevelItem/useJobLevelItem";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/jobcatalog/actions/JobLevelItem/updateJobLevelItemAction",
  () => ({
    updateJobLevelItemAction: jest.fn(),
  })
);

jest.mock(
  "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelItem/useJobLevelItem",
  () => ({
    useInvalidateJobLevelItemQuery: jest.fn(),
  })
);

describe("useUpdateJobLevelItemAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls updateJobLevelItemAction and runs revalidation on success", async () => {
    const mockPayload: UpdateJobLevelItemActionInput = {
      id: "job-level-item-id",
      name: "Updated level item",
    };

    const mockRevalidate = jest.fn();

    (useInvalidateJobLevelItemQuery as jest.Mock).mockReturnValue(
      mockRevalidate
    );
    (updateJobLevelItemAction as jest.Mock).mockResolvedValue({
      status: "SUCCESS",
    });

    let capturedOpts: any;
    (useMutation as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;
      return { mutate: jest.fn(), mutateAsync: opts.mutationFn };
    });

    renderHook(() => useUpdateJobLevelItemAction());

    await act(async () => {
      await capturedOpts.mutationFn(mockPayload);
    });

    expect(updateJobLevelItemAction).toHaveBeenCalledWith(mockPayload);

    capturedOpts.onSuccess?.();
    expect(mockRevalidate).toHaveBeenCalled();
  });
});
