import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import { useCreateJobFamilyAction } from "./useCreateJobFamilyAction";
import type { CreateJobFamilyActionInput } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/CreateJobFamilyAction";
import { createJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/CreateJobFamilyAction";
import { useInvalidateJobFamilyQuery } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useJobFamily";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/CreateJobFamilyAction",
  () => ({
    createJobFamilyAction: jest.fn(),
  })
);

jest.mock(
  "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useJobFamily",
  () => ({
    useInvalidateJobFamilyQuery: jest.fn(),
  })
);

describe("useCreateJobFamilyAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls createJobFamilyAction and runs revalidation on success", async () => {
    const mockPayload: CreateJobFamilyActionInput = { name: "Engineering" };
    const mockRevalidate = jest.fn();

    (useInvalidateJobFamilyQuery as jest.Mock).mockReturnValue(
      mockRevalidate
    );
    (createJobFamilyAction as jest.Mock).mockResolvedValue({ id: "1" });

    let capturedOpts: any;
    (useMutation as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;
      return { mutate: jest.fn(), mutateAsync: opts.mutationFn };
    });

    renderHook(() => useCreateJobFamilyAction());

    await act(async () => {
      await capturedOpts.mutationFn(mockPayload);
    });

    expect(createJobFamilyAction).toHaveBeenCalledWith(mockPayload);

    capturedOpts.onSuccess?.();
    expect(mockRevalidate).toHaveBeenCalled();
  });
});
