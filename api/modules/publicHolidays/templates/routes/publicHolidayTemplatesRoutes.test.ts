import { publicHolidayTemplatesRoutes } from "@/api/modules/publicHolidays/templates/routes";
import { hrisPublicHolidayTemplatesService } from "@/api/modules/publicHolidays/templates/services";

class MockResponse {
  public status: number;

  constructor(
    private body: unknown,
    public init?: any
  ) {
    this.status = init?.status ?? 200;
  }

  async json() {
    return this.body;
  }

  static json(body: unknown, init?: any) {
    return new MockResponse(body, init);
  }
}

Object.defineProperty(globalThis, "Response", {
  value: MockResponse,
  writable: true,
});

jest.mock("@/api/modules/publicHolidays/templates/services", () => ({
  hrisPublicHolidayTemplatesService: {
    list: jest.fn(),
    getById: jest.fn(),
    preview: jest.fn(),
  },
}));

describe("PublicHolidayTemplatesRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lists public holiday templates", async () => {
    const response = [{ id: "template-id" }];

    jest
      .mocked(hrisPublicHolidayTemplatesService.list)
      .mockResolvedValue(response as never);

    const res = await publicHolidayTemplatesRoutes.list({} as Request);
    const result = await res.json();

    expect(hrisPublicHolidayTemplatesService.list).toHaveBeenCalledWith();
    expect(result).toEqual(response);
  });

  it("gets public holiday template by id", async () => {
    const response = { id: "template-id" };

    jest
      .mocked(hrisPublicHolidayTemplatesService.getById)
      .mockResolvedValue(response as never);

    const res = await publicHolidayTemplatesRoutes.getById(
      {} as Request,
      "template-id"
    );
    const result = await res.json();

    expect(hrisPublicHolidayTemplatesService.getById).toHaveBeenCalledWith(
      "template-id"
    );
    expect(result).toEqual(response);
  });

  it("previews public holiday template", async () => {
    const response = {
      templateId: "template-id",
      templateName: "Poland holidays",
      year: 2026,
      holidays: [],
    };

    jest
      .mocked(hrisPublicHolidayTemplatesService.preview)
      .mockResolvedValue(response as never);

    const req = {
      json: async () => ({ year: 2026 }),
    } as Request;

    const res = await publicHolidayTemplatesRoutes.preview(req, "template-id");
    const result = await res.json();

    expect(hrisPublicHolidayTemplatesService.preview).toHaveBeenCalledWith(
      "template-id",
      { year: 2026 }
    );
    expect(result).toEqual(response);
  });
});
