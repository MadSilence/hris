import type {HrisApiRolesService} from "@/api/modules/roles/services/hrisRolesService";
import {hrisApiRolesService} from "@/api/modules/roles/services/hrisRolesService";

export class RoleRoutes {
    private readonly hrisApiRolesService: HrisApiRolesService;

    public constructor(service: HrisApiRolesService) {
        this.hrisApiRolesService = service;
    }

    public async getRoles() {
        const roles = await this.hrisApiRolesService.getRoles();

        return Response.json(roles);
    }

    public async getRoleDeleteImpact(roleId: string) {
        const impact = await this.hrisApiRolesService.getRoleDeleteImpact(roleId);

        return Response.json(impact);
    }

    public async previewRoleAccess(roleIds: string[]) {
        const preview = await this.hrisApiRolesService.previewRoleAccess(roleIds);

        return Response.json(preview);
    }

    public async exportRoles(req: Request) {
        const backendResponse = await this.hrisApiRolesService.exportRoles(formatOf(req));
        return streamBinary(backendResponse);
    }

    public async exportRoleUsers(req: Request, roleId: string) {
        const backendResponse = await this.hrisApiRolesService.exportRoleUsers(roleId, formatOf(req));
        return streamBinary(backendResponse);
    }
}

const formatOf = (req: Request): "csv" | "xlsx" =>
    new URL(req.url).searchParams.get("format") === "csv" ? "csv" : "xlsx";

// Export is the one transport that has to stream a binary through untouched.
const streamBinary = (backendResponse: Response) =>
    new Response(backendResponse.body, {
        status: backendResponse.status,
        headers: {
            "Content-Type": backendResponse.headers.get("content-type") ?? "application/octet-stream",
            "Content-Disposition": backendResponse.headers.get("content-disposition") ?? "attachment",
        },
    });

export const roleRoutes = new RoleRoutes(hrisApiRolesService);
