import { publicHolidayCalendarsRoutes } from "@/api/modules/publicHolidays/calendars/routes";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";
import { PublicHolidayCalendarSourceType, PublicHolidayCalendarStatus, } from "@/api/modules/publicHolidays/calendars/dto";

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

jest.mock("@/api/modules/publicHolidays/calendars/services", () => ({
  hrisPublicHolidayCalendarsService: {
    create: jest.fn(),
    list: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    rename: jest.fn(),
    activate: jest.fn(),
    deactivate: jest.fn(),
    archive: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("PublicHolidayCalendarsRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates public holiday calendar", async () => {
    const response = { id: "calendar-id" };
    const body = {
      name: "Poland 2026",
      year: 2026,
      status: PublicHolidayCalendarStatus.Active,
      sourceType: PublicHolidayCalendarSourceType.Manual,
      sourceExternalId: undefined,
      sourceCountryCode: "PL",
      sourceRegionCode: undefined,
      sourceLocale: "pl-PL",
    };

    jest.mocked(hrisPublicHolidayCalendarsService.create).mockResolvedValue(response);

    const req = { json: async () => body } as Request;

    const res = await publicHolidayCalendarsRoutes.create(req);
    const result = await res.json();

    expect(hrisPublicHolidayCalendarsService.create).toHaveBeenCalledWith({
      ...body,
      sourceExternalId: null,
      sourceRegionCode: null,
    });
    expect(result).toEqual(response);
  });

  it("lists public holiday calendars", async () => {
    const response: any[] = [];

    jest.mocked(hrisPublicHolidayCalendarsService.list).mockResolvedValue(response);

    const res = await publicHolidayCalendarsRoutes.list({} as Request);
    const result = await res.json();

    expect(hrisPublicHolidayCalendarsService.list).toHaveBeenCalledWith();
    expect(result).toEqual(response);
  });

  it("gets public holiday calendar by id", async () => {
    const response = { id: "calendar-id" } as any;

    jest.mocked(hrisPublicHolidayCalendarsService.getById).mockResolvedValue(response);

    const res = await publicHolidayCalendarsRoutes.getById({} as Request, "calendar-id");
    const result = await res.json();

    expect(hrisPublicHolidayCalendarsService.getById).toHaveBeenCalledWith("calendar-id");
    expect(result).toEqual(response);
  });

  it("updates public holiday calendar", async () => {
    const response = { id: "calendar-id", version: 1 };
    const body = {
      name: "Poland updated",
      year: 2026,
      sourceType: PublicHolidayCalendarSourceType.Manual,
      sourceExternalId: undefined,
      sourceCountryCode: "PL",
      sourceRegionCode: undefined,
      sourceLocale: "pl-PL",
    };

    jest.mocked(hrisPublicHolidayCalendarsService.update).mockResolvedValue(response);

    const req = { json: async () => body } as Request;

    const res = await publicHolidayCalendarsRoutes.update(req, "calendar-id");
    const result = await res.json();

    expect(hrisPublicHolidayCalendarsService.update).toHaveBeenCalledWith(
      "calendar-id",
      {
        ...body,
        sourceExternalId: null,
        sourceRegionCode: null,
      }
    );
    expect(result).toEqual(response);
  });

  it("renames public holiday calendar", async () => {
    const response = { id: "calendar-id", version: 1 };

    jest.mocked(hrisPublicHolidayCalendarsService.rename).mockResolvedValue(response);

    const req = { json: async () => ({ name: "New name" }) } as Request;

    const res = await publicHolidayCalendarsRoutes.rename(req, "calendar-id");
    const result = await res.json();

    expect(hrisPublicHolidayCalendarsService.rename).toHaveBeenCalledWith(
      "calendar-id",
      { name: "New name" }
    );
    expect(result).toEqual(response);
  });

  it("handles calendar actions", async () => {
    const response = { id: "calendar-id", version: 1 };

    jest.mocked(hrisPublicHolidayCalendarsService.activate).mockResolvedValue(response);
    jest.mocked(hrisPublicHolidayCalendarsService.deactivate).mockResolvedValue(response);
    jest.mocked(hrisPublicHolidayCalendarsService.archive).mockResolvedValue(response);
    jest.mocked(hrisPublicHolidayCalendarsService.delete).mockResolvedValue(undefined);

    expect(await (await publicHolidayCalendarsRoutes.activate({} as Request, "calendar-id")).json()).toEqual(response);
    expect(await (await publicHolidayCalendarsRoutes.deactivate({} as Request, "calendar-id")).json()).toEqual(response);
    expect(await (await publicHolidayCalendarsRoutes.archive({} as Request, "calendar-id")).json()).toEqual(response);

    const deleteRes = await publicHolidayCalendarsRoutes.delete({} as Request, "calendar-id");

    expect(deleteRes.status).toBe(204);
    expect(hrisPublicHolidayCalendarsService.activate).toHaveBeenCalledWith("calendar-id");
    expect(hrisPublicHolidayCalendarsService.deactivate).toHaveBeenCalledWith("calendar-id");
    expect(hrisPublicHolidayCalendarsService.archive).toHaveBeenCalledWith("calendar-id");
    expect(hrisPublicHolidayCalendarsService.delete).toHaveBeenCalledWith("calendar-id");
  });
});
