import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import { useCreateJobLevelItemAction } from "./useCreateJobLevelItemAction";
import type {
  CreateJobLevelItemActionInput
} from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelItem/createJobLevelItemAction";
import { createJobLevelItemAction } from "@/components/modules/settings/modules/jobcatalog/actions/JobLevelItem/createJobLevelItemAction";
import {
  useInvalidateJobLevelItemQuery
} from "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelItem/useJobLevelItem/useJobLevelItem";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/jobcatalog/actions/JobLevelItem/CreateJobLevelItemAction",
  () => ({
    createJobLevelItemAction: jest.fn(),
  })
);

jest.mock(
  "@/components/modules/settings/modules/jobcatalog/hooks/JobLevelItem/useJobLevelItem",
  () => ({
    useInvalidateJobLevelItemQuery: jest.fn(),
  })
);

describe("useCreateJobLevelItemAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls createJobLevelItemAction and runs revalidation on success", async () => {
    const mockPayload: CreateJobLevelItemActionInput = { name: "Senior Engineer L3" };
    const mockRevalidate = jest.fn();

    (useInvalidateJobLevelItemQuery as jest.Mock).mockReturnValue(
      mockRevalidate
    );
    (createJobLevelItemAction as jest.Mock).mockResolvedValue({ id: "1" });

    let capturedOpts: any;
    (useMutation as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;
      return { mutate: jest.fn(), mutateAsync: opts.mutationFn };
    });

    renderHook(() => useCreateJobLevelItemAction());

    await act(async () => {
      await capturedOpts.mutationFn(mockPayload);
    });

    expect(createJobLevelItemAction).toHaveBeenCalledWith(mockPayload);

    capturedOpts.onSuccess?.();
    expect(mockRevalidate).toHaveBeenCalled();
  });
});
