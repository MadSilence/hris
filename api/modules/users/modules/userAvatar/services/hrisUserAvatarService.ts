import { CreateResponse } from "@/api/models/misc";
import { hrisApiUserAvatarClient } from "@/api/modules/users/modules/userAvatar/clients";

export class HrisUserAvatarService {
  public async uploadAvatar(
    userId: string,
    file: File
  ): Promise<CreateResponse> {
    return hrisApiUserAvatarClient.uploadAvatar(userId, file);
  }

  public async deleteAvatar(userId: string): Promise<void> {
    return hrisApiUserAvatarClient.deleteAvatar(userId);
  }
}

export const hrisUserAvatarService = new HrisUserAvatarService();
