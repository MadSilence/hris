import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import type { CreateLegalEntityActionInput } from "@/components/modules/settings/modules/legalEntity/actions/createLegalEntityAction";
import { createLegalEntityAction, } from "@/components/modules/settings/modules/legalEntity/actions/createLegalEntityAction";
import { useInvalidateLegalEntityQuery, } from "@/components/modules/settings/modules/legalEntity/hooks/useLegalEntity";
import { useCreateLegalEntityAction } from "./useCreateLegalEntityAction";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/legalEntity/actions/createLegalEntityAction",
  () => ({
    createLegalEntityAction: jest.fn(),
  })
);

jest.mock(
  "@/components/modules/settings/modules/legalEntity/hooks/useLegalEntity",
  () => ({
    useInvalidateLegalEntityQuery: jest.fn(),
  })
);

describe("useCreateLegalEntityAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls createLegalEntityAction and runs revalidation on success", async () => {
    const mockPayload: CreateLegalEntityActionInput = {
      name: "ACME",
      description: "",
      registrationNumber: "123",
      taxId: "TAX",
      email: "",
      phone: "",
      country: "UK",
      city: "London",
      street: "Baker",
      building: "221B",
      postCode: "NW1",
    };

    const mockRevalidate = jest.fn();

    (useInvalidateLegalEntityQuery as jest.Mock).mockReturnValue(
      mockRevalidate
    );
    (createLegalEntityAction as jest.Mock).mockResolvedValue({ id: "1" });

    let capturedOpts: any;

    (useMutation as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;
      return {
        mutate: jest.fn(),
        mutateAsync: opts.mutationFn,
      };
    });

    renderHook(() => useCreateLegalEntityAction());

    await act(async () => {
      await capturedOpts.mutationFn(mockPayload);
    });

    expect(createLegalEntityAction).toHaveBeenCalledWith(mockPayload);

    capturedOpts.onSuccess?.();

    expect(mockRevalidate).toHaveBeenCalled();
  });
});
