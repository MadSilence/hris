import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import type { DeleteJobFamilyActionInput, } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/DeleteJobFamilyAction";
import { deleteJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/DeleteJobFamilyAction";
import { useInvalidateJobFamilyQuery } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useJobFamily";
import { useDeleteJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useDeleteJobFamilyActon";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/DeleteJobFamilyAction",
  () => ({
    deleteJobFamilyAction: jest.fn(),
  })
);

jest.mock(
  "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useJobFamily",
  () => ({
    useInvalidateJobFamilyQuery: jest.fn(),
  })
);

describe("useDeleteJobFamilyAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls deleteJobFamilyAction and runs revalidation on success", async () => {
    const mockPayload: DeleteJobFamilyActionInput = {
      id: "job-family-id",
    };

    const mockRevalidate = jest.fn();

    (useInvalidateJobFamilyQuery as jest.Mock).mockReturnValue(
      mockRevalidate
    );
    (deleteJobFamilyAction as jest.Mock).mockResolvedValue({
      status: "SUCCESS",
    });

    let capturedOpts: any;
    (useMutation as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;
      return { mutate: jest.fn(), mutateAsync: opts.mutationFn };
    });

    renderHook(() => useDeleteJobFamilyAction());

    await act(async () => {
      await capturedOpts.mutationFn(mockPayload);
    });

    expect(deleteJobFamilyAction).toHaveBeenCalledWith(mockPayload);

    capturedOpts.onSuccess?.();
    expect(mockRevalidate).toHaveBeenCalled();
  });
});
