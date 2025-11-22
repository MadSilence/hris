import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import type { RenameJobFamilyActionInput, } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/RenameJobFamilyAction";
import { renameJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/RenameJobFamilyAction";
import { useInvalidateJobFamilyQuery } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useJobFamily";
import { useRenameJobFamilyAction } from "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useRenameJobFamilyAction";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/jobcatalog/actions/JobFamily/RenameJobFamilyAction",
  () => ({
    renameJobFamilyAction: jest.fn(),
  })
);

jest.mock(
  "@/components/modules/settings/modules/jobcatalog/hooks/JobFamily/useJobFamily",
  () => ({
    useInvalidateJobFamilyQuery: jest.fn(),
  })
);

describe("useRenameJobFamilyAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls renameJobFamilyAction and runs revalidation on success", async () => {
    const mockPayload: RenameJobFamilyActionInput = {
      id: "job-family-id",
      name: "Engineering",
    };

    const mockRevalidate = jest.fn();

    (useInvalidateJobFamilyQuery as jest.Mock).mockReturnValue(
      mockRevalidate
    );
    (renameJobFamilyAction as jest.Mock).mockResolvedValue({
      status: "SUCCESS",
    });

    let capturedOpts: any;
    (useMutation as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;
      return { mutate: jest.fn(), mutateAsync: opts.mutationFn };
    });

    renderHook(() => useRenameJobFamilyAction());

    await act(async () => {
      await capturedOpts.mutationFn(mockPayload);
    });

    expect(renameJobFamilyAction).toHaveBeenCalledWith(mockPayload);

    capturedOpts.onSuccess?.();
    expect(mockRevalidate).toHaveBeenCalled();
  });
});
