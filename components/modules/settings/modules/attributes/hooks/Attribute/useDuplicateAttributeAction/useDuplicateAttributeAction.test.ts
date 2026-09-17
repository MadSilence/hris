import type { CapturedReactQueryOptions } from "@/test/types";
import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { duplicateAttributeAction } from "@/components/modules/settings/modules/attributes/actions/Attribute/duplicateAttributeAction";
import { useInvalidateAttributeGroupsQuery } from "@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups";
import { useDuplicateAttributeAction } from "./useDuplicateAttributeAction";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));
jest.mock("@/components/modules/settings/modules/attributes/actions/Attribute/duplicateAttributeAction", () => ({
  duplicateAttributeAction: jest.fn(),
}));
jest.mock("@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups", () => ({
  useInvalidateAttributeGroupsQuery: jest.fn(),
}));

describe("useDuplicateAttributeAction", () => {
  let capturedOpts!: CapturedReactQueryOptions;
  const mockRevalidate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useInvalidateAttributeGroupsQuery as jest.Mock).mockReturnValue(mockRevalidate);
    (useMutation as jest.Mock).mockImplementation((opts: CapturedReactQueryOptions) => {
      capturedOpts = opts;
      return { mutate: jest.fn(), mutateAsync: opts.mutationFn };
    });
  });

  it("calls duplicateAttributeAction and refreshes the sections on success", async () => {
    (duplicateAttributeAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS, data: { id: "2" } });

    renderHook(() => useDuplicateAttributeAction());

    await act(async () => {
      await capturedOpts.mutationFn({ id: "1" });
    });

    expect(duplicateAttributeAction).toHaveBeenCalledWith({ id: "1" });

    capturedOpts.onSuccess({ status: ActionStatus.SUCCESS, data: { id: "2" } });
    expect(mockRevalidate).toHaveBeenCalledTimes(1);
  });

  it("does not refresh when the backend refused the copy", () => {
    renderHook(() => useDuplicateAttributeAction());

    capturedOpts.onSuccess({ status: ActionStatus.ERROR, errorMessage: "An attribute with this name already exists." });
    expect(mockRevalidate).not.toHaveBeenCalled();
  });
});
