import { hrisFirstRunService } from "@/api/modules/firstRun/services";

export class FirstRunRoutes {
  public async getCompanySetup() {
    return Response.json(await hrisFirstRunService.getCompanySetup());
  }

  public async getSetupCountries() {
    return Response.json(await hrisFirstRunService.getSetupCountries());
  }

  public async getWelcome() {
    return Response.json(await hrisFirstRunService.getWelcome());
  }

  public async getUserSettings() {
    return Response.json(await hrisFirstRunService.getUserSettings());
  }
}

export const firstRunRoutes = new FirstRunRoutes();
