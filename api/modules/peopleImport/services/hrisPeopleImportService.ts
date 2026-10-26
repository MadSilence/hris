import { hrisApiPeopleImportClient } from "@/api/modules/peopleImport/clients";
import type {
  PeopleImportDTO,
  PeopleImportRowDTO,
  PeopleImportUpdateRequest,
} from "@/api/modules/peopleImport/dto";

/**
 * People import — the seam every transport meets at. Nothing to map: the page reads the backend's
 * import as it is, because every step's screen is drawn from it.
 */
export class HrisPeopleImportService {
  public async getCurrent(): Promise<PeopleImportDTO | null> {
    return (await hrisApiPeopleImportClient.getCurrent()) ?? null;
  }

  public async get(id: string): Promise<PeopleImportDTO> {
    return hrisApiPeopleImportClient.get(id);
  }

  public async rows(id: string, errorsOnly: boolean): Promise<PeopleImportRowDTO[]> {
    return hrisApiPeopleImportClient.rows(id, errorsOnly);
  }

  public async upload(form: FormData): Promise<PeopleImportDTO> {
    return hrisApiPeopleImportClient.upload(form);
  }

  public async update(id: string, body: PeopleImportUpdateRequest): Promise<PeopleImportDTO> {
    return hrisApiPeopleImportClient.update(id, body);
  }

  public async check(id: string): Promise<PeopleImportDTO> {
    return hrisApiPeopleImportClient.check(id);
  }

  public async apply(id: string): Promise<PeopleImportDTO> {
    return hrisApiPeopleImportClient.apply(id);
  }

  public async invite(id: string): Promise<PeopleImportDTO> {
    return hrisApiPeopleImportClient.invite(id);
  }

  public async discard(id: string): Promise<PeopleImportDTO> {
    return hrisApiPeopleImportClient.discard(id);
  }

  public async template(format: "csv" | "xlsx"): Promise<Response> {
    return hrisApiPeopleImportClient.template(format);
  }

  public async errorFile(id: string): Promise<Response> {
    return hrisApiPeopleImportClient.errorFile(id);
  }
}

export const hrisPeopleImportService = new HrisPeopleImportService();
