import { hrisApiSegmentsClient } from "@/api/modules/segments/clients/hrisApiSegmentsClient";
import { Segment, SegmentResolveResponse } from "@/models/segment/Segment";

export class HrisSegmentsService {
  public async resolve(
    segment: Segment,
    params: { cursor?: string | null; limit?: number; q?: string | null; include?: string[] | null },
  ): Promise<SegmentResolveResponse> {
    return hrisApiSegmentsClient.resolve(segment, params);
  }
}

export const hrisSegmentsService = new HrisSegmentsService();
