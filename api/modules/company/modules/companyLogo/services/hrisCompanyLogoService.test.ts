import { hrisApiCompanyLogoClient } from "@/api/modules/company/modules/companyLogo/clients";
import { hrisCompanyLogoService } from "@/api/modules/company/modules/companyLogo/services/hrisCompanyLogoService";


jest.mock("@/api/modules/company/modules/companyLogo/clients", () => ({
  hrisApiCompanyLogoClient: {
    uploadLogo: jest.fn(),
    deleteLogo: jest.fn(),
  },
}));

describe("HrisCompanyLogoService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delegates uploadLogo to client", async () => {
    const file = new File(["logo"], "logo.png", { type: "image/png" });
    const response = { id: "logo-id" };

    jest.mocked(hrisApiCompanyLogoClient.uploadLogo).mockResolvedValue(response);

    const result = await hrisCompanyLogoService.uploadLogo(file);

    expect(hrisApiCompanyLogoClient.uploadLogo).toHaveBeenCalledWith(file);
    expect(result).toEqual(response);
  });

  it("delegates deleteLogo to client", async () => {
    jest.mocked(hrisApiCompanyLogoClient.deleteLogo).mockResolvedValue(undefined);

    const result = await hrisCompanyLogoService.deleteLogo();

    expect(hrisApiCompanyLogoClient.deleteLogo).toHaveBeenCalledWith();
    expect(result).toBeUndefined();
  });
});
