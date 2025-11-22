import {Role} from "@/models/role/Role";
import {hrisApiRolesClient} from "@/api/modules/roles/clients/hrisApiRolesClient";
import {roleMapper} from "@/api/modules/roles/mappers/roleMapper";
import {DuplicateRoleRequest} from "@/api/modules/roles/dto/DuplicateRoleRequest";
import {CreateRoleRequest} from "@/api/modules/roles/dto/CreateRoleRequest";
import {UpdateRoleNameRequest} from "@/api/modules/roles/dto/UpdateRoleNameRequest";
import {NewEntity, UpdatedEntity} from "@/models/misc";

export class HrisApiRolesService {
    public async getRoles(): Promise<Role[]> {
        const response = await hrisApiRolesClient.getRoles();
        return response.map((role) => roleMapper.mapRoleDTOtoRole(role));
    };

    public async createRole(payload: CreateRoleRequest): Promise<NewEntity> {
        const createResponse = await hrisApiRolesClient.createRole(payload);

        return {
            id: createResponse.id,
        };
    };

    public async updateRoleName(id: string, payload: UpdateRoleNameRequest): Promise<UpdatedEntity> {
        const updateResponse = await hrisApiRolesClient.updateRoleName(id, payload);

        return {
            id: updateResponse.id,
        };
    };

    public async duplicateRole(id: string, payload: DuplicateRoleRequest): Promise<NewEntity> {
        const createResponse = await hrisApiRolesClient.duplicateRole(id, payload);

        return {
            id: createResponse.id,
        };
    };

    // public async deleteRole(id: string): Promise<Role[]> {
    //     return await hrisApiRolesClient.deleteRole(id);
    // }
}

export const hrisApiRolesService = new HrisApiRolesService();
