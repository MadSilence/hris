import { documentsRoutes } from "@/api/modules/documents/routes/documentsRoutes";
import { hrisDocumentsService } from "@/api/modules/documents/services/hrisDocumentsService";

class MockResponse {
  public status: number;

  constructor(
    private body: unknown,
    public init?: ResponseInit
  ) {
    this.status = init?.status ?? 200;
  }

  async json() {
    return this.body;
  }

  static json(body: unknown, init?: ResponseInit) {
    return new MockResponse(body, init);
  }
}

Object.defineProperty(globalThis, "Response", {
  value: MockResponse,
  writable: true,
});

jest.mock("@/api/modules/documents/services/hrisDocumentsService", () => ({
  hrisDocumentsService: {
    getFolderDeleteImpact: jest.fn(),
  },
}));

describe("DocumentsRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * The delete dialog asks the backend what deleting this folder would take with it. The Java
   * endpoint and the BFF service and client all existed; the controller method and its `route.ts`
   * did not, so every ask answered 404 and the dialog offered "Delete" with no idea what it held.
   */
  it("passes a folder delete-impact request to the service and returns its answer", async () => {
    const impact = { documentCount: 3, subfolderCount: 1 };
    (hrisDocumentsService.getFolderDeleteImpact as jest.Mock).mockResolvedValue(impact);

    // The handler ignores the request object — the ids come from the route params.
    const response = await documentsRoutes.getFolderDeleteImpact({} as Request, "u1", "f1");

    expect(hrisDocumentsService.getFolderDeleteImpact).toHaveBeenCalledWith("u1", "f1");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(impact);
  });
});
