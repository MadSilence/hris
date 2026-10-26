import {
  hrisApiPeopleViewsClient,
  type PeopleViewUpsert,
  type SharePreviewGrantee,
} from "@/api/modules/peopleViews/clients/hrisApiPeopleViewsClient";
import type {
  PeopleView,
  PeopleViewShare,
  ShareGrantee,
  SharePermission,
  SharePreview,
} from "@/models/peopleView";

class HrisApiPeopleViewsService {
  public list(): Promise<PeopleView[]> {
    return hrisApiPeopleViewsClient.list();
  }

  public create(body: PeopleViewUpsert): Promise<PeopleView> {
    return hrisApiPeopleViewsClient.create(body);
  }

  public update(id: string, body: PeopleViewUpsert): Promise<PeopleView> {
    return hrisApiPeopleViewsClient.update(id, body);
  }

  public duplicate(id: string): Promise<PeopleView> {
    return hrisApiPeopleViewsClient.duplicate(id);
  }

  public remove(id: string): Promise<void> {
    return hrisApiPeopleViewsClient.remove(id);
  }

  public listShares(id: string): Promise<PeopleViewShare[]> {
    return hrisApiPeopleViewsClient.listShares(id);
  }

  public share(id: string, grantees: ShareGrantee[]): Promise<PeopleViewShare[]> {
    return hrisApiPeopleViewsClient.share(id, grantees);
  }

  public previewShare(id: string, grantees: SharePreviewGrantee[]): Promise<SharePreview> {
    return hrisApiPeopleViewsClient.previewShare(id, grantees);
  }

  public updateShare(id: string, shareId: string, permission: SharePermission): Promise<PeopleViewShare> {
    return hrisApiPeopleViewsClient.updateShare(id, shareId, permission);
  }

  public unshare(id: string, shareId: string): Promise<void> {
    return hrisApiPeopleViewsClient.unshare(id, shareId);
  }
}

export const hrisApiPeopleViewsService = new HrisApiPeopleViewsService();
