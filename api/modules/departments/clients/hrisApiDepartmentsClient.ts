import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  DepartmentDTO,
  DepartmentTreeNodeDTO,
  DepartmentSummaryDTO,
  DepartmentPersonDTO,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  MoveDepartmentRequest,
  DeleteDepartmentRequest,
  ArchiveDepartmentRequest,
  ActivateDepartmentRequest,
  DepartmentRestoreImpactDTO,
} from "@/api/modules/departments/dto";
import { departmentMapper } from "@/api/modules/departments/mappers";
import type { CreateResponse, UpdateResponse } from "@/api/models/misc";
import type {
  Department,
  DepartmentTreeNode,
  DepartmentSummary,
  DepartmentPerson,
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

  public async summary(includeArchived = false): Promise<DepartmentSummary> {
    const params = new URLSearchParams();
    if (includeArchived) params.set("includeArchived", "true");
    const dto = await hrisApiClient.get<DepartmentSummaryDTO>(
      `${this.BASE_PATH}/summary?${params}`
    );
    return { peopleAssigned: dto.peopleAssigned, unitsTotal: dto.unitsTotal };
  }

  public async people(q?: string): Promise<DepartmentPerson[]> {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const dtos = await hrisApiClient.get<DepartmentPersonDTO[]>(
      `${this.BASE_PATH}/people?${params}`
    );
    return dtos;
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

  public async move(id: string, body: MoveDepartmentRequest): Promise<UpdateResponse> {
    return hrisApiClient.post<UpdateResponse>(
      `${this.BASE_PATH}/${id}/move`,
      body as unknown as Record<string, unknown>,
    );
  }

  public async archive(id: string, body?: ArchiveDepartmentRequest): Promise<UpdateResponse> {
    return hrisApiClient.post<UpdateResponse>(
      `${this.BASE_PATH}/${id}/archive`,
      body as unknown as Record<string, unknown>,
    );
  }

  public async activate(id: string, body?: ActivateDepartmentRequest): Promise<UpdateResponse> {
    // No body at all when nothing is chosen: the backend reads that as "the department alone", as before.
    return hrisApiClient.post<UpdateResponse>(
      `${this.BASE_PATH}/${id}/activate`,
      body?.restoreUnitIds?.length ? { restoreUnitIds: body.restoreUnitIds } : undefined,
    );
  }

  /** The archived sub-units that could come back with this department, in tree order. */
  public async restoreImpact(id: string): Promise<DepartmentRestoreImpactDTO> {
    return hrisApiClient.get<DepartmentRestoreImpactDTO>(`${this.BASE_PATH}/${id}/restore-impact`);
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
