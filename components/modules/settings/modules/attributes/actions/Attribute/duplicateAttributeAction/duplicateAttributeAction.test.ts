import { ActionStatus } from "@/components/models/ActionStatus";
import {
  duplicateAttributeAction,
  DuplicateAttributeActionInput,
} from "@/components/modules/settings/modules/attributes/actions/Attribute/duplicateAttributeAction/duplicateAttributeAction";
import { attributeService } from "@/api/modules/attributes/services/attributeService";

jest.mock("next/cache");
jest.mock("@/api/modules/attributes/services/attributeService", () => ({
  attributeService: {
    duplicateAttribute: jest.fn(),
  },
}));

describe("duplicateAttributeAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it("asks for a copy without a name, so the backend names it", async () => {
    const input: DuplicateAttributeActionInput = { id: "attr-123" };

    await duplicateAttributeAction(input);

    expect(attributeService.duplicateAttribute).toHaveBeenCalledWith("attr-123", undefined);
  });

  it("passes a chosen name through", async () => {
    await duplicateAttributeAction({ id: "attr-123", name: "Shirt size" });

    expect(attributeService.duplicateAttribute).toHaveBeenCalledWith("attr-123", "Shirt size");
  });

  it("returns SUCCESS with the new id when the service resolves", async () => {
    (attributeService.duplicateAttribute as jest.Mock).mockResolvedValue({ id: "attr-456" });

    const result = await duplicateAttributeAction({ id: "attr-123" });

    expect(result).toEqual({
      status: ActionStatus.SUCCESS,
      data: { id: "attr-456" },
    });
  });

  it("returns ERROR when the service rejects", async () => {
    (attributeService.duplicateAttribute as jest.Mock).mockRejectedValue(new Error("Test error"));

    const result = await duplicateAttributeAction({ id: "attr-123" });

    expect(result).toEqual({
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred. Please try again.",
    });
  });
});
