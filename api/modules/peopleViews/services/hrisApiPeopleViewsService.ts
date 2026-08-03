import {
  hrisApiPeopleViewsClient,
  type PeopleViewUpsert,
} from "@/api/modules/peopleViews/clients/hrisApiPeopleViewsClient";
import type { PeopleView, SharedView, ViewPayload } from "@/models/peopleView";

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

  public share(payload: ViewPayload): Promise<{ token: string }> {
    return hrisApiPeopleViewsClient.share(payload);
  }

  public resolveShare(token: string): Promise<SharedView> {
    return hrisApiPeopleViewsClient.resolveShare(token);
  }
}

export const hrisApiPeopleViewsService = new HrisApiPeopleViewsService();
