import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  PeopleImportDTO,
  PeopleImportKind,
  PeopleImportRowDTO,
  PeopleImportRowsEditRequest,
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

  /** The kind travels as a query parameter; the form carries only the file. */
  public async upload(form: FormData, kind: PeopleImportKind): Promise<PeopleImportDTO> {
    return hrisApiClient.postForm<PeopleImportDTO>(`${BASE}?kind=${kind}`, form);
  }

  /** The kinds the caller may run, in move-in order. */
  public async kinds(): Promise<PeopleImportKind[]> {
    return hrisApiClient.get<PeopleImportKind[]>(`${BASE}/kinds`);
  }

  public async editRows(id: string, body: PeopleImportRowsEditRequest): Promise<PeopleImportDTO> {
    return hrisApiClient.post<PeopleImportDTO>(`${BASE}/${id}/rows`, { ...body });
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
  public async template(format: "csv" | "xlsx", kind: PeopleImportKind): Promise<Response> {
    return hrisApiClient.fetch(`${BASE}/template?format=${format}&kind=${kind}`, "*/*");
  }

  public async errorFile(id: string): Promise<Response> {
    return hrisApiClient.fetch(`${BASE}/${id}/error-file`, "*/*");
  }
}

export const hrisApiPeopleImportClient = new HrisApiPeopleImportClient();
