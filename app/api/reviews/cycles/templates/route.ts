import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiReviewsService } from "@/api/modules/reviews/services";

/** The cycle templates (REVIEWS_PLAN.md 11.2), listed apart from the cycles. */
export const GET = apiRequestWrapper(async () => NextResponse.json(await hrisApiReviewsService.listTemplates()));
