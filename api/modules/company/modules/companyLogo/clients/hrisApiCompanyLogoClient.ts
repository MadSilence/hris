import { CreateResponse } from "@/api/models/misc";
import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";

export class HrisApiCompanyLogoClient {
  private readonly BASE_PATH = "/api/companies";

  public async uploadLogo(file: File): Promise<CreateResponse> {
    const formData = new FormData();
    formData.append("file", file);

    return hrisApiClient.postForm<CreateResponse>(
      `${this.BASE_PATH}/logo`,
      formData
    );
  }

  public async deleteLogo(): Promise<void> {
    return hrisApiClient.post<void>(`${this.BASE_PATH}/logo/delete`);
  }
}

export const hrisApiCompanyLogoClient = new HrisApiCompanyLogoClient();
