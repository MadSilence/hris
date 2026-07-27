import { hrisApiDepartmentsClient } from "@/api/modules/departments/clients";
import type {
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DeleteDepartmentRequest,
  AssignDepartmentMemberRequest,
  AssignDepartmentLeadRequest,
} from "@/api/modules/departments/dto";
import type { CreateResponse, UpdateResponse } from "@/api/models/misc";
import type {
  Department,
  DepartmentTreeNode,
  DepartmentMembersPage,
} from "@/models/departments";

export class HrisDepartmentsService {
  public async list(): Promise<Department[]> {
    return hrisApiDepartmentsClient.list();
  }

  public async tree(nested: boolean, includeArchived?: boolean): Promise<DepartmentTreeNode[]> {
    return hrisApiDepartmentsClient.tree(nested, includeArchived);
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

  public async archive(id: string): Promise<UpdateResponse> {
    return hrisApiDepartmentsClient.archive(id);
  }

  public async activate(id: string): Promise<UpdateResponse> {
    return hrisApiDepartmentsClient.activate(id);
  }

  public async delete(id: string, body: DeleteDepartmentRequest): Promise<void> {
    return hrisApiDepartmentsClient.delete(id, body);
  }

  public async getMembers(id: string, page: number, size: number): Promise<DepartmentMembersPage> {
    return hrisApiDepartmentsClient.getMembers(id, page, size);
  }

  public async addMember(id: string, body: AssignDepartmentMemberRequest): Promise<void> {
    return hrisApiDepartmentsClient.addMember(id, body);
  }

  public async removeMember(id: string, userId: string): Promise<void> {
    return hrisApiDepartmentsClient.removeMember(id, userId);
  }

  public async setLead(id: string, body: AssignDepartmentLeadRequest): Promise<void> {
    return hrisApiDepartmentsClient.setLead(id, body);
  }
}

export const hrisDepartmentsService = new HrisDepartmentsService();
