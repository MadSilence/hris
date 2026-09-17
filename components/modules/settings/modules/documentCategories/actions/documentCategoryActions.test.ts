import { saveDocumentCategoryAction } from "@/components/modules/settings/modules/documentCategories/actions/documentCategoryActions";
import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";
import { ActionStatus } from "@/components/models/ActionStatus";

jest.mock("@/api/modules/documents/services/hrisDocumentsService", () => ({
  hrisDocumentsService: {
    createCategory: jest.fn(),
    updateCategory: jest.fn(),
  },
}));

describe("saveDocumentCategoryAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sends the version the dialog was opened with on an edit", async () => {
    const result = await saveDocumentCategoryAction({
      id: "cat-1",
      name: "Contracts",
      description: null,
      isActive: false,
      version: 4,
    });

    expect(result.status).toBe(ActionStatus.SUCCESS);
    expect(hrisDocumentsService.updateCategory).toHaveBeenCalledWith("cat-1", {
      name: "Contracts",
      description: null,
      isActive: false,
      version: 4,
    });
  });

  // The create body is strict on the backend and has no version, so it must not carry one.
  it("does not send a version on a create", async () => {
    await saveDocumentCategoryAction({ name: "Payslips", description: "Monthly" });

    expect(hrisDocumentsService.createCategory).toHaveBeenCalledWith({
      name: "Payslips",
      description: "Monthly",
      isActive: true,
    });
  });
});
