import { publicHolidaysRoutes } from "@/api/modules/publicHolidays/holidays/routes";
import { hrisPublicHolidaysService } from "@/api/modules/publicHolidays/holidays/services";

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

jest.mock("@/api/modules/publicHolidays/holidays/services", () => ({
  hrisPublicHolidaysService: {
    list: jest.fn(),
  },
}));

describe("PublicHolidaysRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lists public holidays by calendar", async () => {
    const response: never[] = [];

    jest.mocked(hrisPublicHolidaysService.list).mockResolvedValue(response);

    // The jsdom env has no global Request; the route only reads `url`, so a stub is enough.
    const req = { url: "http://localhost/api/public-holiday/calendars/calendar-id/holidays" } as Request;
    const res = await publicHolidaysRoutes.list(req, "calendar-id");
    const result = await res.json();

    expect(hrisPublicHolidaysService.list).toHaveBeenCalledWith("calendar-id", undefined);
    expect(result).toEqual(response);
  });

  it("passes the year query through to the service", async () => {
    jest.mocked(hrisPublicHolidaysService.list).mockResolvedValue([]);

    const req = {
      url: "http://localhost/api/public-holiday/calendars/calendar-id/holidays?year=2026",
    } as Request;
    await publicHolidaysRoutes.list(req, "calendar-id");

    expect(hrisPublicHolidaysService.list).toHaveBeenCalledWith("calendar-id", 2026);
  });
});
