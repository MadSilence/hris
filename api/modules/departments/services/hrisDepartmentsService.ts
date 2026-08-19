import { hrisApiDepartmentsClient } from "@/api/modules/departments/clients";
import type {
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  MoveDepartmentRequest,
  DeleteDepartmentRequest,
  ArchiveDepartmentRequest,
} from "@/api/modules/departments/dto";
import type { CreateResponse, UpdateResponse } from "@/api/models/misc";
import type {
  Department,
  DepartmentTreeNode,
  DepartmentSummary,
  DepartmentPerson,
} from "@/models/departments";

export class HrisDepartmentsService {
  public async list(): Promise<Department[]> {
    return hrisApiDepartmentsClient.list();
  }

  public async tree(nested: boolean, includeArchived?: boolean): Promise<DepartmentTreeNode[]> {
    return hrisApiDepartmentsClient.tree(nested, includeArchived);
  }

  public async summary(includeArchived?: boolean): Promise<DepartmentSummary> {
    return hrisApiDepartmentsClient.summary(includeArchived);
  }

  public async people(q?: string): Promise<DepartmentPerson[]> {
    return hrisApiDepartmentsClient.people(q);
  }

  public async getById(id: string): Promise<Department> {
    return hrisApiDepartmentsClient.getById(id);
  }

  public async create(body: CreateDepartmentRequest): Promise<CreateResponse> {
    return hrisApiDepartmentsClient.create(body);
  }

  public async update(id: string, body: UpdateDepartmentRequest): Promise<UpdateResponse> {
    return hrisApiDepartmentsClient.update(id, body);
  }

  public async move(id: string, body: MoveDepartmentRequest): Promise<UpdateResponse> {
    return hrisApiDepartmentsClient.move(id, body);
  }

  public async archive(id: string, body?: ArchiveDepartmentRequest): Promise<UpdateResponse> {
    return hrisApiDepartmentsClient.archive(id, body);
  }

  public async activate(id: string): Promise<UpdateResponse> {
    return hrisApiDepartmentsClient.activate(id);
  }

  public async delete(id: string, body: DeleteDepartmentRequest): Promise<void> {
    return hrisApiDepartmentsClient.delete(id, body);
  }

  public async exportTree(
    id: string,
    opts: { format: "csv" | "xlsx"; includeSubNodes: boolean; includePeople: boolean },
  ): Promise<Response> {
    return hrisApiDepartmentsClient.exportTree(id, opts);
  }
}

export const hrisDepartmentsService = new HrisDepartmentsService();
