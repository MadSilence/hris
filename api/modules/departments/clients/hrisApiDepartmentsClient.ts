import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  DepartmentDTO,
  DepartmentTreeNodeDTO,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DeleteDepartmentRequest,
  ArchiveDepartmentRequest,
} from "@/api/modules/departments/dto";
import { departmentMapper } from "@/api/modules/departments/mappers";
import type { CreateResponse, UpdateResponse } from "@/api/models/misc";
import type {
  Department,
  DepartmentTreeNode,
} from "@/models/departments";

function toBackendBody(
  body: CreateDepartmentRequest | UpdateDepartmentRequest,
): Record<string, unknown> {
  const { description, ...rest } = body;
  return { ...rest, about: description };
}

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
    return hrisApiClient.post<CreateResponse>(this.BASE_PATH, toBackendBody(body));
  }

  public async update(id: string, body: UpdateDepartmentRequest): Promise<UpdateResponse> {
    return hrisApiClient.patch<UpdateResponse>(`${this.BASE_PATH}/${id}`, toBackendBody(body));
  }

  public async archive(id: string, body?: ArchiveDepartmentRequest): Promise<UpdateResponse> {
    return hrisApiClient.post<UpdateResponse>(
      `${this.BASE_PATH}/${id}/archive`,
      body as unknown as Record<string, unknown>,
    );
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

  public async exportTree(
    id: string,
    opts: { format: "csv" | "xlsx"; includeSubNodes: boolean; includePeople: boolean },
  ): Promise<Response> {
    const params = new URLSearchParams({
      format: opts.format,
      includeSubNodes: String(opts.includeSubNodes),
      includePeople: String(opts.includePeople),
    });
    return hrisApiClient.fetch(`${this.BASE_PATH}/${id}/export?${params}`);
  }

}

export const hrisApiDepartmentsClient = new HrisApiDepartmentsClient();
