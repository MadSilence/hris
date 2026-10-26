import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  PeopleImportDTO,
  PeopleImportRowDTO,
  PeopleImportUpdateRequest,
} from "@/api/modules/peopleImport/dto";

const BASE = "/people-imports";

/** `PeopleImportController` — URLs and DTOs only. */
export class HrisApiPeopleImportClient {
  /** The import to resume, or `undefined` when there is none (204). */
  public async getCurrent(): Promise<PeopleImportDTO | undefined> {
    return hrisApiClient.get<PeopleImportDTO | undefined>(`${BASE}/current`);
  }

  public async get(id: string): Promise<PeopleImportDTO> {
    return hrisApiClient.get<PeopleImportDTO>(`${BASE}/${id}`);
  }

  public async rows(id: string, errorsOnly: boolean): Promise<PeopleImportRowDTO[]> {
    return hrisApiClient.get<PeopleImportRowDTO[]>(`${BASE}/${id}/rows?errorsOnly=${errorsOnly}`);
  }

  public async upload(form: FormData): Promise<PeopleImportDTO> {
    return hrisApiClient.postForm<PeopleImportDTO>(BASE, form);
  }

  public async update(id: string, body: PeopleImportUpdateRequest): Promise<PeopleImportDTO> {
    return hrisApiClient.patch<PeopleImportDTO, PeopleImportUpdateRequest>(`${BASE}/${id}`, body);
  }

  public async check(id: string): Promise<PeopleImportDTO> {
    return hrisApiClient.post<PeopleImportDTO>(`${BASE}/${id}/check`);
  }

  public async apply(id: string): Promise<PeopleImportDTO> {
    return hrisApiClient.post<PeopleImportDTO>(`${BASE}/${id}/apply`);
  }

  public async invite(id: string): Promise<PeopleImportDTO> {
    return hrisApiClient.post<PeopleImportDTO>(`${BASE}/${id}/invite`);
  }

  public async discard(id: string): Promise<PeopleImportDTO> {
    return hrisApiClient.post<PeopleImportDTO>(`${BASE}/${id}/discard`);
  }

  /** Binary: streamed through untouched, the file name in `Content-Disposition`. */
  public async template(format: "csv" | "xlsx"): Promise<Response> {
    return hrisApiClient.fetch(`${BASE}/template?format=${format}`, "*/*");
  }

  public async errorFile(id: string): Promise<Response> {
    return hrisApiClient.fetch(`${BASE}/${id}/error-file`, "*/*");
  }
}

export const hrisApiPeopleImportClient = new HrisApiPeopleImportClient();
