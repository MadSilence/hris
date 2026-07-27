import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import { Segment, SegmentResolveResponse } from "@/models/segment/Segment";

class HrisApiSegmentsClient {
  public async resolve(
    segment: Segment,
    params: { cursor?: string | null; limit?: number; q?: string | null; include?: string[] | null },
  ): Promise<SegmentResolveResponse> {
    return hrisApiClient.post<SegmentResolveResponse>("/segments/resolve", {
      segment,
      cursor: params.cursor ?? null,
      limit: params.limit,
      q: params.q ?? null,
      include: params.include ?? null,
    });
  }
}

export const hrisApiSegmentsClient = new HrisApiSegmentsClient();
