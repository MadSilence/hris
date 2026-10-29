import { hrisApiHomeClient } from "@/api/modules/home/clients";
import { resolveBackendAssetUrl } from "@/api/modules/users/mappers/userMapper/resolveBackendAssetUrl";
import type { Celebrations, WhosOut, WhosOutAudience, WhosOutRange } from "@/models/home";

/**
 * Home's two reads. Nothing is filtered here — who may be named, and what may be said about them, is
 * Java's answer (`HomeWhosOutService`, `HomeCelebrationsService`). The one thing done is what every
 * avatar in the product needs: the backend's `/uploads/…` path made absolute.
 */
export class HrisApiHomeService {
  public async whosOut(range: WhosOutRange, audience: WhosOutAudience): Promise<WhosOut> {
    const dto = await hrisApiHomeClient.whosOut(range, audience);
    return {
      ...dto,
      people: dto.people.map((person) => ({ ...person, avatarUrl: resolveBackendAssetUrl(person.avatarUrl) })),
    };
  }

  public async celebrations(upcoming: boolean): Promise<Celebrations> {
    const dto = await hrisApiHomeClient.celebrations(upcoming);
    return {
      ...dto,
      birthdayFieldName: dto.birthdayFieldName ?? null,
      items: dto.items.map((item) => ({ ...item, avatarUrl: resolveBackendAssetUrl(item.avatarUrl) })),
    };
  }
}

export const hrisApiHomeService = new HrisApiHomeService();
