import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { CreateResponse } from "@/api/models/misc";

export class HrisApiUserAvatarClient {
  private readonly BASE_PATH = "/users";

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

  /**
   * A one-time link for uploading your own photo from a phone.
   *
   * Only ever for the signed-in person — the backend takes no id — so there is no parameter here
   * either. `expiresInSeconds` lets the screen retire the code instead of showing a dead one.
   */
  public async issueAvatarUploadToken(): Promise<{ token: string; expiresInSeconds: number }> {
    return hrisApiClient.post<{ token: string; expiresInSeconds: number }>(
      `${this.BASE_PATH}/me/avatar-upload-token`
    );
  }

  public async deleteAvatar(userId: string): Promise<void> {
    return hrisApiClient.post<void>(
      `${this.BASE_PATH}/${userId}/avatar/delete`
    );
  }
}

export const hrisApiUserAvatarClient = new HrisApiUserAvatarClient();
