import { hrisCompanyLogoService } from "@/api/modules/company/modules/companyLogo/services";

export class CompanyLogoRoutes {
  public async uploadLogo(req: Request) {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        { message: "File is required" },
        { status: 400 }
      );
    }

    const data = await hrisCompanyLogoService.uploadLogo(file);
    return Response.json(data);
  }

  public async deleteLogo(_req: Request) {
    await hrisCompanyLogoService.deleteLogo();
    return new Response(null, { status: 204 });
  }
}

export const companyLogoRoutes = new CompanyLogoRoutes();
