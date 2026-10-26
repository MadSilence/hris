import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  PeopleView,
  PeopleViewShare,
  ShareGrantee,
  SharePermission,
  SharePreview,
  ViewPayload,
} from "@/models/peopleView";

export type PeopleViewUpsert = { name: string; payload: ViewPayload };

export type SharePreviewGrantee = Pick<ShareGrantee, "granteeType" | "granteeId">;

class HrisApiPeopleViewsClient {
  public list(): Promise<PeopleView[]> {
    return hrisApiClient.get<PeopleView[]>("/people-views");
  }

  public create(body: PeopleViewUpsert): Promise<PeopleView> {
    return hrisApiClient.post<PeopleView>("/people-views", body as unknown as Record<string, unknown>);
  }

  public update(id: string, body: PeopleViewUpsert): Promise<PeopleView> {
    return hrisApiClient.put<PeopleView>(`/people-views/${id}`, body);
  }

  public duplicate(id: string): Promise<PeopleView> {
    return hrisApiClient.post<PeopleView>(`/people-views/${id}/duplicate`);
  }

  public remove(id: string): Promise<void> {
    return hrisApiClient.delete<void>(`/people-views/${id}`);
  }

  public listShares(id: string): Promise<PeopleViewShare[]> {
    return hrisApiClient.get<PeopleViewShare[]>(`/people-views/${id}/shares`);
  }

  public share(id: string, grantees: ShareGrantee[]): Promise<PeopleViewShare[]> {
    return hrisApiClient.post<PeopleViewShare[]>(`/people-views/${id}/shares`, { grantees });
  }

  public previewShare(id: string, grantees: SharePreviewGrantee[]): Promise<SharePreview> {
    return hrisApiClient.post<SharePreview>(`/people-views/${id}/shares/preview`, { grantees });
  }

  public updateShare(id: string, shareId: string, permission: SharePermission): Promise<PeopleViewShare> {
    return hrisApiClient.put<PeopleViewShare>(`/people-views/${id}/shares/${shareId}`, { permission });
  }

  public unshare(id: string, shareId: string): Promise<void> {
    return hrisApiClient.delete<void>(`/people-views/${id}/shares/${shareId}`);
  }
}

export const hrisApiPeopleViewsClient = new HrisApiPeopleViewsClient();
