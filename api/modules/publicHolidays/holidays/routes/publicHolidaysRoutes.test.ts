import { publicHolidaysRoutes } from "@/api/modules/publicHolidays/holidays/routes";
import { hrisPublicHolidaysService } from "@/api/modules/publicHolidays/holidays/services";

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

jest.mock("@/api/modules/publicHolidays/holidays/services", () => ({
  hrisPublicHolidaysService: {
    create: jest.fn(),
    list: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    rename: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("PublicHolidaysRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates public holiday", async () => {
    const response = { id: "holiday-id" };
    const body = {
      name: "New Year",
      holidayDate: "2026-01-01",
    };

    jest.mocked(hrisPublicHolidaysService.create).mockResolvedValue(response);

    const req = { json: async () => body } as Request;

    const res = await publicHolidaysRoutes.create(req, "calendar-id");
    const result = await res.json();

    expect(hrisPublicHolidaysService.create).toHaveBeenCalledWith(
      "calendar-id",
      body
    );
    expect(result).toEqual(response);
  });

  it("lists public holidays by calendar", async () => {
    const response: any[] = [];

    jest.mocked(hrisPublicHolidaysService.list).mockResolvedValue(response);

    const res = await publicHolidaysRoutes.list({} as Request, "calendar-id");
    const result = await res.json();

    expect(hrisPublicHolidaysService.list).toHaveBeenCalledWith("calendar-id");
    expect(result).toEqual(response);
  });

  it("gets public holiday by id", async () => {
    const response = { id: "holiday-id" } as any;

    jest.mocked(hrisPublicHolidaysService.getById).mockResolvedValue(response);

    const res = await publicHolidaysRoutes.getById({} as Request, "holiday-id");
    const result = await res.json();

    expect(hrisPublicHolidaysService.getById).toHaveBeenCalledWith("holiday-id");
    expect(result).toEqual(response);
  });

  it("updates public holiday", async () => {
    const response = { id: "holiday-id", version: 1 };
    const body = {
      name: "Updated holiday",
      holidayDate: "2026-01-02",
    };

    jest.mocked(hrisPublicHolidaysService.update).mockResolvedValue(response);

    const req = { json: async () => body } as Request;

    const res = await publicHolidaysRoutes.update(req, "holiday-id");
    const result = await res.json();

    expect(hrisPublicHolidaysService.update).toHaveBeenCalledWith(
      "holiday-id",
      body
    );
    expect(result).toEqual(response);
  });

  it("renames public holiday", async () => {
    const response = { id: "holiday-id", version: 1 };

    jest.mocked(hrisPublicHolidaysService.rename).mockResolvedValue(response);

    const req = { json: async () => ({ name: "New name" }) } as Request;

    const res = await publicHolidaysRoutes.rename(req, "holiday-id");
    const result = await res.json();

    expect(hrisPublicHolidaysService.rename).toHaveBeenCalledWith(
      "holiday-id",
      { name: "New name" }
    );
    expect(result).toEqual(response);
  });

  it("deletes public holiday", async () => {
    jest.mocked(hrisPublicHolidaysService.delete).mockResolvedValue(undefined);

    const res = await publicHolidaysRoutes.delete({} as Request, "holiday-id");

    expect(hrisPublicHolidaysService.delete).toHaveBeenCalledWith("holiday-id");
    expect(res.status).toBe(204);
  });
});
