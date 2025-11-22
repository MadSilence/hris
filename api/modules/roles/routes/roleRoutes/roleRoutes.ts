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
    //
    // public async getRole() {
    //     return await this.hrisApiRolesService.getRole();
    // }
}

export const roleRoutes = new RoleRoutes(hrisApiRolesService);
