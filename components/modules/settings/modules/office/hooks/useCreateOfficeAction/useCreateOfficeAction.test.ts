import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import type { CreateOfficeActionInput } from "@/components/modules/settings/modules/office/actions/createOfficeAction";
import { createOfficeAction } from "@/components/modules/settings/modules/office/actions/createOfficeAction";
import { useInvalidateOfficeQuery } from "@/components/modules/settings/modules/office/hooks/useOffice";
import { useCreateOfficeAction } from "./useCreateOfficeAction";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/office/actions/createOfficeAction",
  () => ({
    createOfficeAction: jest.fn(),
  })
);

jest.mock(
  "@/components/modules/settings/modules/office/hooks/useOffice",
  () => ({
    useInvalidateOfficeQuery: jest.fn(),
  })
);

describe("useCreateOfficeAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls createOfficeAction and runs revalidation on success", async () => {
    const mockPayload: CreateOfficeActionInput = {
      name: "Berlin HQ",
      description: "",
      email: "",
      phone: "",
      isSystem: false,
      country: "Germany",
      city: "Berlin",
      street: "Unter den Linden",
      building: "10",
      postCode: "10117",
    };

    const mockRevalidate = jest.fn();

    (useInvalidateOfficeQuery as jest.Mock).mockReturnValue(mockRevalidate);
    (createOfficeAction as jest.Mock).mockResolvedValue({ id: "1" });

    let capturedOpts: any;

    (useMutation as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;
      return {
        mutate: jest.fn(),
        mutateAsync: opts.mutationFn,
      };
    });

    renderHook(() => useCreateOfficeAction());

    await act(async () => {
      await capturedOpts.mutationFn(mockPayload);
    });

    expect(createOfficeAction).toHaveBeenCalledWith(mockPayload);

    capturedOpts.onSuccess?.();

    expect(mockRevalidate).toHaveBeenCalled();
  });
});
