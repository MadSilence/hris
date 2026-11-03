import { NextResponse } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisApiReviewsService } from "@/api/modules/reviews/services";

export const GET = apiRequestWrapper(async () => NextResponse.json(await hrisApiReviewsService.listForms()));
