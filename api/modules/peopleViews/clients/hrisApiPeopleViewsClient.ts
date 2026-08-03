import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type { PeopleView, SharedView, ViewPayload } from "@/models/peopleView";

export type PeopleViewUpsert = { name: string; payload: ViewPayload };

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

  public share(payload: ViewPayload): Promise<{ token: string }> {
    return hrisApiClient.post<{ token: string }>("/people-views/share", { payload } as unknown as Record<string, unknown>);
  }

  public resolveShare(token: string): Promise<SharedView> {
    return hrisApiClient.get<SharedView>(`/people-view-shares/${encodeURIComponent(token)}`);
  }
}

export const hrisApiPeopleViewsClient = new HrisApiPeopleViewsClient();
