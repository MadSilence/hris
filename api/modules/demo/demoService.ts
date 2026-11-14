import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type { CompanyState, GoLivePreview, GoLiveStatus } from "@/models/demo";

/**
 * The demo company, the trial and going live (DEMO_PLAN.md). Java owns every rule — who may go live
 * (`SETTINGS.BILLING`), what is kept, when anything is erased; this only carries the calls.
 */
class DemoService {
  public async state(): Promise<CompanyState> {
    return hrisApiClient.get<CompanyState>("/company/state");
  }

  /** Where going live stands; null when nobody has asked (Java answers 204). */
  public async goLiveStatus(): Promise<GoLiveStatus | null> {
    const status = await hrisApiClient.get<GoLiveStatus | "" | undefined>("/go-live");
    return status ? status : null;
  }

  public async goLivePreview(): Promise<GoLivePreview> {
    return hrisApiClient.get<GoLivePreview>("/go-live/preview");
  }

  public async requestGoLive(keep: string[]): Promise<GoLiveStatus> {
    return hrisApiClient.post<GoLiveStatus>("/go-live", { keep });
  }

  public async retryGoLive(): Promise<GoLiveStatus> {
    return hrisApiClient.post<GoLiveStatus>("/go-live/retry");
  }
}

export const demoService = new DemoService();
