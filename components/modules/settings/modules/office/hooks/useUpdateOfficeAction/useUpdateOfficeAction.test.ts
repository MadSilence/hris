import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import type { UpdateOfficeActionInput } from "@/components/modules/settings/modules/office/actions/updateOfficeAction";
import { updateOfficeAction } from "@/components/modules/settings/modules/office/actions/updateOfficeAction";
import { useInvalidateOfficeQuery } from "@/components/modules/settings/modules/office/hooks/useOffice";
import { useUpdateOfficeAction } from "./useUpdateOfficeAction";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/office/actions/updateOfficeAction",
  () => ({
    updateOfficeAction: jest.fn(),
  })
);

jest.mock(
  "@/components/modules/settings/modules/office/hooks/useOffice",
  () => ({
    useInvalidateOfficeQuery: jest.fn(),
  })
);

describe("useUpdateOfficeAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls updateOfficeAction and runs revalidation on success", async () => {
    const mockPayload: UpdateOfficeActionInput = {
      id: "office-123",
      name: "Berlin HQ Updated",
      description: "",
      email: "",
      phone: "",
      isSystem: false,
      country: "Germany",
      city: "Berlin",
      street: "Teststrasse",
      building: "5",
      postCode: "10117",
    };

    const mockRevalidate = jest.fn();

    (useInvalidateOfficeQuery as jest.Mock).mockReturnValue(mockRevalidate);
    (updateOfficeAction as jest.Mock).mockResolvedValue({
      status: "SUCCESS",
    });

    let capturedOpts: any;

    (useMutation as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;
      return {
        mutate: jest.fn(),
        mutateAsync: opts.mutationFn,
      };
    });

    renderHook(() => useUpdateOfficeAction());

    await act(async () => {
      await capturedOpts.mutationFn(mockPayload);
    });

    expect(updateOfficeAction).toHaveBeenCalledWith(mockPayload);

    capturedOpts.onSuccess?.();

    expect(mockRevalidate).toHaveBeenCalled();
  });
});
