import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { CreateResponse } from "@/api/models/misc";

export class HrisApiUserAvatarClient {
  private readonly BASE_PATH = "/api/users";

  public async uploadAvatar(
    userId: string,
    file: File
  ): Promise<CreateResponse> {
    const formData = new FormData();
    formData.append("file", file);

    return hrisApiClient.postForm<CreateResponse>(
      `${this.BASE_PATH}/${userId}/avatar`,
      formData
    );
  }

  public async deleteAvatar(userId: string): Promise<void> {
    return hrisApiClient.post<void>(
      `${this.BASE_PATH}/${userId}/avatar/delete`
    );
  }
}

export const hrisApiUserAvatarClient = new HrisApiUserAvatarClient();
