import { hrisUserAvatarService } from "@/api/modules/users/modules/userAvatar/services";

export class UserAvatarRoutes {
  public async uploadAvatar(req: Request, userId: string) {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        { message: "File is required" },
        { status: 400 }
      );
    }

    const data = await hrisUserAvatarService.uploadAvatar(userId, file);
    return Response.json(data);
  }

  public async deleteAvatar(_req: Request, userId: string) {
    await hrisUserAvatarService.deleteAvatar(userId);
    return new Response(null, { status: 204 });
  }
}

export const userAvatarRoutes = new UserAvatarRoutes();
