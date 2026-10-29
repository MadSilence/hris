import { hrisApiHomeService } from "@/api/modules/home/services";
import type { WhosOutAudience, WhosOutRange } from "@/models/home";

/** Copied value by value: what reaches Java is what home can ask for, nothing more. */
export class HomeRoutes {
  public async whosOut(req: Request) {
    const params = new URL(req.url).searchParams;
    const range: WhosOutRange = params.get("range") === "WEEK" ? "WEEK" : "TODAY";
    const audience: WhosOutAudience = params.get("audience") === "EVERYONE" ? "EVERYONE" : "TEAM";
    return Response.json(await hrisApiHomeService.whosOut(range, audience));
  }

  public async celebrations(req: Request) {
    const upcoming = new URL(req.url).searchParams.get("upcoming") === "true";
    return Response.json(await hrisApiHomeService.celebrations(upcoming));
  }
}

export const homeRoutes = new HomeRoutes();
