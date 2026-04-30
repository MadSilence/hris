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
    };

    const result = companyMapper.mapCompanyDTOtoCompany(dto);

    expect(result).toEqual({
      id: "company-id",
      name: "My Company",
      subdomain: "my-company",
      companyLogo: "http://localhost:8080/uploads/logo.png",
    });
  });

  it("returns null companyLogo when dto companyLogo is null", () => {
    const dto: CompanyDTO = {
      id: "company-id",
      name: "My Company",
      subdomain: "my-company",
      companyLogo: null,
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
});
