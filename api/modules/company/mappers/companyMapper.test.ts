import { companyMapper } from "@/api/modules/company/mappers/companyMapper";
import { CompanyDTO } from "@/api/modules/company/dto/CompanyDTO";

describe("companyMapper", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...OLD_ENV,
      BACKEND_URL: "http://localhost:8080",
    };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("maps company dto to company", () => {
    const dto: CompanyDTO = {
      id: "company-id",
      name: "My Company",
      subdomain: "my-company",
      companyLogo: "/uploads/logo.png",
      description: "A modern HR platform",
      website: "https://my-company.com",
    };

    const result = companyMapper.mapCompanyDTOtoCompany(dto);

    expect(result).toEqual({
      id: "company-id",
      name: "My Company",
      subdomain: "my-company",
      companyLogo: "http://localhost:8080/uploads/logo.png",
      description: "A modern HR platform",
      website: "https://my-company.com",
    });
  });

  it("returns null companyLogo when dto companyLogo is null", () => {
    const dto: CompanyDTO = {
      id: "company-id",
      name: "My Company",
      subdomain: "my-company",
      companyLogo: null,
      description: null,
      website: null,
    };

    const result = companyMapper.mapCompanyDTOtoCompany(dto);

    expect(result.companyLogo).toBeNull();
  });

  it("keeps absolute logo urls unchanged", () => {
    const result = companyMapper.resolveBackendAssetUrl(
      "https://cdn.example.com/logo.png",
    );

    expect(result).toBe("https://cdn.example.com/logo.png");
  });

  it("adds slash before relative path", () => {
    const result = companyMapper.resolveBackendAssetUrl("uploads/logo.png");

    expect(result).toBe("http://localhost:8080/uploads/logo.png");
  });

  it("carries the working week through", () => {
    // It did not, and nothing failed: this mapper lists fields explicitly, so `workingDays` was
    // added to the backend DTO, shipped, and reached nobody — the calendar went on shading Saturday
    // and Sunday from its fallback while the server was sending the real week.
    const result = companyMapper.mapCompanyDTOtoCompany({
      id: "1",
      name: "Acme",
      subdomain: "acme",
      companyLogo: null,
      description: null,
      website: null,
      workingDays: ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"],
      weekStartDay: "SUNDAY",
    });

    expect(result.workingDays).toEqual(["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"]);
    expect(result.weekStartDay).toBe("SUNDAY");
  });
});
