import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  AgreeResultDTO,
  AudienceResolveRequestDTO,
  AudienceResolvedDTO,
  CreatedDTO,
  DraftSavedDTO,
  DraftWriteDTO,
  FileUploadedDTO,
  HandbookDTO,
  HubHomeDTO,
  HubSettingsDTO,
  HubSettingsWriteDTO,
  ManagePostRowDTO,
  MoveRequestDTO,
  MyAgreementsDTO,
  OverviewDTO,
  PageCreateDTO,
  PageDTO,
  PageEditDTO,
  PagePropsWriteDTO,
  PageTreeDTO,
  PostDTO,
  PostEditDTO,
  PostPageDTO,
  PostWriteDTO,
  PublishedDTO,
  PublishRequestDTO,
  RemindedDTO,
  ReorderRequestDTO,
  SavedItemDTO,
  SearchResultDTO,
  SectionDeleteImpactDTO,
  SectionDeleteRequestDTO,
  SectionWriteDTO,
  WhoAgreedDTO,
} from "@/api/modules/hub/dto";
import type { AgreementTab, FeedScope, PostStatusFilter, PostType, SavedType } from "@/models/hub";

const query = (params: Record<string, string | null | undefined>): string => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  const text = search.toString();
  return text ? `?${text}` : "";
};

const body = <T extends object>(value: T): Record<string, unknown> => value as unknown as Record<string, unknown>;

/** The hub's backend URLs (`/hub/**`), one method per endpoint. No logic. */
export class HrisApiHubClient {
  // ── reading ──
  home = (scope: FeedScope) => hrisApiClient.get<HubHomeDTO>(`/hub/home${query({ scope })}`);
  posts = (params: { scope: FeedScope; type: PostType | null; q: string | null; cursor: string | null }) =>
    hrisApiClient.get<PostPageDTO>(`/hub/posts${query(params)}`);
  post = (id: string) => hrisApiClient.get<PostDTO>(`/hub/posts/${id}`);
  handbook = () => hrisApiClient.get<HandbookDTO>("/hub/handbook");
  page = (id: string) => hrisApiClient.get<PageDTO>(`/hub/pages/${id}`);
  agree = (id: string, revisionId: string) => hrisApiClient.post<AgreeResultDTO>(`/hub/pages/${id}/agree`, { revisionId });
  agreements = () => hrisApiClient.get<MyAgreementsDTO>("/hub/agreements");
  saved = () => hrisApiClient.get<SavedItemDTO[]>("/hub/saved");
  save = (type: SavedType, id: string) => hrisApiClient.put<void>(`/hub/saved/${type}/${id}`);
  unsave = (type: SavedType, id: string) => hrisApiClient.delete<void>(`/hub/saved/${type}/${id}`);
  search = (q: string, pagesOnly: boolean) =>
    hrisApiClient.get<SearchResultDTO>(`/hub/search${query({ q, pagesOnly: pagesOnly ? "true" : null })}`);
  file = (id: string): Promise<Response> => hrisApiClient.fetch(`/hub/files/${id}`, "image/*");

  // ── managing: posts ──
  overview = () => hrisApiClient.get<OverviewDTO>("/hub/manage/overview");
  managePosts = (status: PostStatusFilter, q: string | null) =>
    hrisApiClient.get<ManagePostRowDTO[]>(`/hub/manage/posts${query({ status, q })}`);
  createPost = (write: PostWriteDTO) => hrisApiClient.post<CreatedDTO>("/hub/manage/posts/create", body(write));
  postEdit = (id: string) => hrisApiClient.get<PostEditDTO>(`/hub/manage/posts/${id}`);
  updatePost = (id: string, write: PostWriteDTO) => hrisApiClient.patch<void, PostWriteDTO>(`/hub/manage/posts/${id}`, write);
  publishPost = (id: string) => hrisApiClient.post<void>(`/hub/manage/posts/${id}/publish`);
  schedulePost = (id: string, publishAt: string) => hrisApiClient.post<void>(`/hub/manage/posts/${id}/schedule`, { publishAt });
  cancelSchedule = (id: string) => hrisApiClient.post<void>(`/hub/manage/posts/${id}/cancel-schedule`);
  unpublishPost = (id: string) => hrisApiClient.post<void>(`/hub/manage/posts/${id}/unpublish`);
  pinPost = (id: string) => hrisApiClient.post<void>(`/hub/manage/posts/${id}/pin`);
  unpinPost = (id: string) => hrisApiClient.post<void>(`/hub/manage/posts/${id}/unpin`);
  duplicatePost = (id: string) => hrisApiClient.post<CreatedDTO>(`/hub/manage/posts/${id}/duplicate`);
  deletePost = (id: string) => hrisApiClient.post<void>(`/hub/manage/posts/${id}/delete`);

  // ── managing: sections ──
  pageTree = () => hrisApiClient.get<PageTreeDTO>("/hub/manage/pages");
  createSection = (write: SectionWriteDTO) => hrisApiClient.post<CreatedDTO>("/hub/manage/sections/create", body(write));
  updateSection = (id: string, write: SectionWriteDTO) =>
    hrisApiClient.patch<void, SectionWriteDTO>(`/hub/manage/sections/${id}`, write);
  reorderSections = (request: ReorderRequestDTO) => hrisApiClient.post<void>("/hub/manage/sections/reorder", body(request));
  sectionDeleteImpact = (id: string) => hrisApiClient.get<SectionDeleteImpactDTO>(`/hub/manage/sections/${id}/delete-impact`);
  deleteSection = (id: string, request: SectionDeleteRequestDTO) =>
    hrisApiClient.post<void>(`/hub/manage/sections/${id}/delete`, body(request));

  // ── managing: pages ──
  createPage = (request: PageCreateDTO) => hrisApiClient.post<CreatedDTO>("/hub/manage/pages/create", body(request));
  pageEdit = (id: string) => hrisApiClient.get<PageEditDTO>(`/hub/manage/pages/${id}`);
  saveDraft = (id: string, write: DraftWriteDTO) => hrisApiClient.put<DraftSavedDTO, DraftWriteDTO>(`/hub/manage/pages/${id}/draft`, write);
  updatePageProps = (id: string, write: PagePropsWriteDTO) =>
    hrisApiClient.patch<void, PagePropsWriteDTO>(`/hub/manage/pages/${id}`, write);
  publishPage = (id: string, request: PublishRequestDTO) =>
    hrisApiClient.post<PublishedDTO>(`/hub/manage/pages/${id}/publish`, body(request));
  previewPage = (id: string) => hrisApiClient.get<PageDTO>(`/hub/manage/pages/${id}/preview`);
  movePage = (id: string, request: MoveRequestDTO) => hrisApiClient.post<void>(`/hub/manage/pages/${id}/move`, body(request));
  reorderPages = (request: ReorderRequestDTO) => hrisApiClient.post<void>("/hub/manage/pages/reorder", body(request));
  duplicatePage = (id: string) => hrisApiClient.post<CreatedDTO>(`/hub/manage/pages/${id}/duplicate`);
  unpublishPage = (id: string) => hrisApiClient.post<void>(`/hub/manage/pages/${id}/unpublish`);
  deletePage = (id: string) => hrisApiClient.post<void>(`/hub/manage/pages/${id}/delete`);

  // ── managing: who agreed ──
  whoAgreed = (id: string, tab: AgreementTab) => hrisApiClient.get<WhoAgreedDTO>(`/hub/manage/pages/${id}/agreements${query({ tab })}`);
  exportAgreements = (id: string, tab: AgreementTab): Promise<Response> =>
    hrisApiClient.fetch(`/hub/manage/pages/${id}/agreements/export${query({ tab })}`, "text/csv, */*");
  remind = (id: string, userIds: string[]) => hrisApiClient.post<RemindedDTO>(`/hub/manage/pages/${id}/remind`, { userIds });

  // ── files, audience, settings ──
  uploadFile = (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return hrisApiClient.postForm<FileUploadedDTO>("/hub/manage/files", form);
  };
  resolveAudience = (request: AudienceResolveRequestDTO) =>
    hrisApiClient.post<AudienceResolvedDTO>("/hub/audience/resolve", body(request));
  settings = () => hrisApiClient.get<HubSettingsDTO>("/hub/manage/settings");
  updateSettings = (write: HubSettingsWriteDTO) => hrisApiClient.patch<HubSettingsDTO, HubSettingsWriteDTO>("/hub/manage/settings", write);
}

export const hrisApiHubClient = new HrisApiHubClient();
