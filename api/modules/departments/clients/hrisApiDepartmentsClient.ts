import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  DepartmentDTO,
  DepartmentTreeNodeDTO,
  DepartmentMembersPageDTO,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DeleteDepartmentRequest,
  AssignDepartmentMemberRequest,
  AssignDepartmentLeadRequest,
} from "@/api/modules/departments/dto";
import { departmentMapper } from "@/api/modules/departments/mappers";
import type { CreateResponse, UpdateResponse } from "@/api/models/misc";
import type {
  Department,
  DepartmentTreeNode,
  DepartmentMembersPage,
} from "@/models/departments";

export class HrisApiDepartmentsClient {
  private readonly BASE_PATH = "/departments";

  public async list(): Promise<Department[]> {
    const dtos = await hrisApiClient.get<DepartmentDTO[]>(this.BASE_PATH);
    return departmentMapper.mapDTOs(dtos);
  }

  public async tree(nested: boolean, includeArchived = false): Promise<DepartmentTreeNode[]> {
    const params = new URLSearchParams({ nested: String(nested) });
    if (includeArchived) params.set("includeArchived", "true");
    const dtos = await hrisApiClient.get<DepartmentTreeNodeDTO[]>(
      `${this.BASE_PATH}/tree?${params}`
    );
    return departmentMapper.mapTreeNodeDTOs(dtos);
  }

  public async getById(id: string): Promise<Department> {
    const dto = await hrisApiClient.get<DepartmentDTO>(`${this.BASE_PATH}/${id}`);
    return departmentMapper.mapDTO(dto);
  }

  public async create(body: CreateDepartmentRequest): Promise<CreateResponse> {
    return hrisApiClient.post<CreateResponse>(
      this.BASE_PATH,
      body as unknown as Record<string, unknown>
    );
  }

  public async update(id: string, body: UpdateDepartmentRequest): Promise<UpdateResponse> {
    return hrisApiClient.patch<UpdateResponse, UpdateDepartmentRequest>(
      `${this.BASE_PATH}/${id}`,
      body
    );
  }

  public async archive(id: string): Promise<UpdateResponse> {
    return hrisApiClient.post<UpdateResponse>(`${this.BASE_PATH}/${id}/archive`);
  }

  public async activate(id: string): Promise<UpdateResponse> {
    return hrisApiClient.post<UpdateResponse>(`${this.BASE_PATH}/${id}/activate`);
  }

  public async delete(id: string, body: DeleteDepartmentRequest): Promise<void> {
    return hrisApiClient.post<void>(
      `${this.BASE_PATH}/${id}/delete`,
      body as unknown as Record<string, unknown>
    );
  }

  public async getMembers(id: string, page: number, size: number): Promise<DepartmentMembersPage> {
    const params = new URLSearchParams({ page: String(page), size: String(size), full: "false" });
    const dto = await hrisApiClient.get<DepartmentMembersPageDTO>(
      `${this.BASE_PATH}/${id}/members?${params}`
    );
    return departmentMapper.mapMembersPageDTO(dto);
  }

  public async addMember(id: string, body: AssignDepartmentMemberRequest): Promise<void> {
    return hrisApiClient.post<void>(
      `${this.BASE_PATH}/${id}/members`,
      body as unknown as Record<string, unknown>
    );
  }

  public async removeMember(id: string, userId: string): Promise<void> {
    return hrisApiClient.delete<void>(`${this.BASE_PATH}/${id}/members/${userId}`);
  }

  public async setLead(id: string, body: AssignDepartmentLeadRequest): Promise<void> {
    return hrisApiClient.post<void>(
      `${this.BASE_PATH}/${id}/lead`,
      body as unknown as Record<string, unknown>
    );
  }
}

export const hrisApiDepartmentsClient = new HrisApiDepartmentsClient();
