import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { hrisApiCompanyLogoClient } from "@/api/modules/company/modules/companyLogo/clients/hrisApiCompanyLogoClient";

jest.mock("@/api/clients/hrisApiClient/hrisApiClient", () => ({
  hrisApiClient: {
    post: jest.fn(),
    postForm: jest.fn(),
  },
}));

describe("HrisApiCompanyLogoClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("uploads company logo", async () => {
    const file = new File(["logo"], "logo.png", { type: "image/png" });
    const response = { id: "logo-id" };

    jest.mocked(hrisApiClient.postForm).mockResolvedValue(response);

    const result = await hrisApiCompanyLogoClient.uploadLogo(file);

    expect(hrisApiClient.postForm).toHaveBeenCalledWith(
      "/api/companies/logo",
      expect.any(FormData)
    );
    expect(result).toEqual(response);
  });

  it("deletes company logo", async () => {
    jest.mocked(hrisApiClient.post).mockResolvedValue(undefined);

    const result = await hrisApiCompanyLogoClient.deleteLogo();

    expect(hrisApiClient.post).toHaveBeenCalledWith(
      "/api/companies/logo/delete"
    );
    expect(result).toBeUndefined();
  });
});
