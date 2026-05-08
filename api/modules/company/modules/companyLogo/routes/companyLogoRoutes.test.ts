import { hrisCompanyLogoService } from "@/api/modules/company/modules/companyLogo/services";
import { companyLogoRoutes } from "@/api/modules/company/modules/companyLogo/routes/companyLogoRoutes";

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

jest.mock("@/api/modules/company/modules/companyLogo/services", () => ({
  hrisCompanyLogoService: {
    uploadLogo: jest.fn(),
    deleteLogo: jest.fn(),
  },
}));

describe("CompanyLogoRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("uploads company logo", async () => {
    const file = new File(["logo"], "logo.png", { type: "image/png" });
    const response = { id: "logo-id" };

    jest.mocked(hrisCompanyLogoService.uploadLogo).mockResolvedValue(response);

    const req = {
      formData: async () => {
        const formData = new FormData();
        formData.append("file", file);
        return formData;
      },
    } as Request;

    const res = await companyLogoRoutes.uploadLogo(req);
    const result = await res.json();

    expect(hrisCompanyLogoService.uploadLogo).toHaveBeenCalledWith(file);
    expect(result).toEqual(response);
  });

  it("returns 400 when file is missing", async () => {
    const req = {
      formData: async () => new FormData(),
    } as Request;

    const res = await companyLogoRoutes.uploadLogo(req);
    const result = await res.json();

    expect(hrisCompanyLogoService.uploadLogo).not.toHaveBeenCalled();
    expect(res.status).toBe(400);
    expect(result).toEqual({ message: "File is required" });
  });

  it("deletes company logo", async () => {
    jest.mocked(hrisCompanyLogoService.deleteLogo).mockResolvedValue(undefined);

    const res = await companyLogoRoutes.deleteLogo({} as Request);

    expect(hrisCompanyLogoService.deleteLogo).toHaveBeenCalledWith();
    expect(res.status).toBe(204);
  });
});
