import type { PublicHolidayCalendar } from "@/models/publicHolidays/calendar";
import { partialMock } from "@/test/types";
import { publicHolidayCalendarsRoutes } from "@/api/modules/publicHolidays/calendars/routes";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";

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

jest.mock("@/api/modules/publicHolidays/calendars/services", () => ({
  hrisPublicHolidayCalendarsService: {
    list: jest.fn(),
    getById: jest.fn(),
  },
}));

describe("PublicHolidayCalendarsRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lists public holiday calendars", async () => {
    const response: never[] = [];

    jest.mocked(hrisPublicHolidayCalendarsService.list).mockResolvedValue(response);

    const res = await publicHolidayCalendarsRoutes.list({} as Request);
    const result = await res.json();

    expect(hrisPublicHolidayCalendarsService.list).toHaveBeenCalledWith();
    expect(result).toEqual(response);
  });

  it("gets public holiday calendar by id", async () => {
    const response = partialMock<PublicHolidayCalendar>({ id: "calendar-id" });

    jest.mocked(hrisPublicHolidayCalendarsService.getById).mockResolvedValue(response);

    const res = await publicHolidayCalendarsRoutes.getById({} as Request, "calendar-id");
    const result = await res.json();

    expect(hrisPublicHolidayCalendarsService.getById).toHaveBeenCalledWith("calendar-id");
    expect(result).toEqual(response);
  });
});
