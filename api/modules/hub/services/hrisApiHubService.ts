import { hrisApiHubClient } from "@/api/modules/hub/clients";
import { resolveBackendAssetUrl } from "@/api/modules/users/mappers/userMapper/resolveBackendAssetUrl";
import type {
  AgreementTab,
  AudienceResolveRequest,
  DraftWrite,
  FeedScope,
  HubSettingsWrite,
  ManagePostRow,
  MoveRequest,
  PageCreate,
  PagePropsWrite,
  PersonRef,
  PostCard,
  PostStatusFilter,
  PostType,
  PostWrite,
  PublishRequest,
  ReorderRequest,
  SavedType,
  SectionDeleteRequest,
  SectionWrite,
} from "@/models/hub";

/** Every avatar in the product: the backend's `/uploads/…` path made absolute. */
const person = (p: PersonRef | null | undefined): PersonRef | null =>
  p ? { ...p, avatarUrl: resolveBackendAssetUrl(p.avatarUrl) } : null;
const card = (c: PostCard): PostCard => ({ ...c, author: person(c.author) });
const row = (r: ManagePostRow): ManagePostRow => ({ ...r, author: person(r.author) });

/**
 * The seam for the company hub: every transport — a route handler, a server action, an RSC — calls this. Nothing is
 * filtered here: who may read what is Java's answer (the audience, `hub_visibility`), and who may manage is
 * `HUB.CONTENT` in Java's `AccessEngine`.
 */
export class HrisApiHubService {
  // ── reading ──
  home = async (scope: FeedScope) => {
    const dto = await hrisApiHubClient.home(scope);
    return { ...dto, pinned: dto.pinned ? card(dto.pinned) : null, posts: dto.posts.map(card) };
  };
  posts = async (params: { scope: FeedScope; type: PostType | null; q: string | null; cursor: string | null }) => {
    const dto = await hrisApiHubClient.posts(params);
    return { ...dto, items: dto.items.map(card) };
  };
  post = async (id: string) => {
    const dto = await hrisApiHubClient.post(id);
    return { ...dto, author: person(dto.author) };
  };
  handbook = () => hrisApiHubClient.handbook();
  page = async (id: string) => {
    const dto = await hrisApiHubClient.page(id);
    return { ...dto, owner: person(dto.owner) };
  };
  agree = (id: string, revisionId: string) => hrisApiHubClient.agree(id, revisionId);
  agreements = () => hrisApiHubClient.agreements();
  saved = () => hrisApiHubClient.saved();
  save = (type: SavedType, id: string) => hrisApiHubClient.save(type, id);
  unsave = (type: SavedType, id: string) => hrisApiHubClient.unsave(type, id);
  search = (q: string, pagesOnly: boolean) => hrisApiHubClient.search(q, pagesOnly);
  file = (id: string) => hrisApiHubClient.file(id);

  // ── managing: posts ──
  overview = async () => {
    const dto = await hrisApiHubClient.overview();
    return { ...dto, latestPosts: dto.latestPosts.map(row) };
  };
  managePosts = async (status: PostStatusFilter, q: string | null) => (await hrisApiHubClient.managePosts(status, q)).map(row);
  createPost = (write: PostWrite) => hrisApiHubClient.createPost(write);
  postEdit = (id: string) => hrisApiHubClient.postEdit(id);
  updatePost = (id: string, write: PostWrite) => hrisApiHubClient.updatePost(id, write);
  publishPost = (id: string) => hrisApiHubClient.publishPost(id);
  schedulePost = (id: string, publishAt: string) => hrisApiHubClient.schedulePost(id, publishAt);
  cancelSchedule = (id: string) => hrisApiHubClient.cancelSchedule(id);
  unpublishPost = (id: string) => hrisApiHubClient.unpublishPost(id);
  pinPost = (id: string) => hrisApiHubClient.pinPost(id);
  unpinPost = (id: string) => hrisApiHubClient.unpinPost(id);
  duplicatePost = (id: string) => hrisApiHubClient.duplicatePost(id);
  deletePost = (id: string) => hrisApiHubClient.deletePost(id);

  /**
   * Saves a post and then moves it where the author asked — one act on the screen, two calls here: the write, then
   * publish or schedule. A post that does not exist yet is created first.
   */
  savePost = async (input: { id: string | null; write: PostWrite; then: "DRAFT" | "PUBLISH" | "SCHEDULE"; publishAt: string | null }) => {
    let id = input.id;
    if (id) await hrisApiHubClient.updatePost(id, input.write);
    else id = (await hrisApiHubClient.createPost(input.write)).id;
    if (input.then === "PUBLISH") await hrisApiHubClient.publishPost(id);
    if (input.then === "SCHEDULE" && input.publishAt) await hrisApiHubClient.schedulePost(id, input.publishAt);
    return { id };
  };

  // ── managing: the handbook ──
  pageTree = async () => {
    const dto = await hrisApiHubClient.pageTree();
    return {
      ...dto,
      sections: dto.sections.map((s) => ({ ...s, pages: s.pages.map((p) => ({ ...p, owner: person(p.owner) })) })),
    };
  };
  createSection = (write: SectionWrite) => hrisApiHubClient.createSection(write);
  updateSection = (id: string, write: SectionWrite) => hrisApiHubClient.updateSection(id, write);
  reorderSections = (request: ReorderRequest) => hrisApiHubClient.reorderSections(request);
  sectionDeleteImpact = (id: string) => hrisApiHubClient.sectionDeleteImpact(id);
  deleteSection = (id: string, request: SectionDeleteRequest) => hrisApiHubClient.deleteSection(id, request);
  createPage = (request: PageCreate) => hrisApiHubClient.createPage(request);
  pageEdit = async (id: string) => {
    const dto = await hrisApiHubClient.pageEdit(id);
    return { ...dto, owner: person(dto.owner) };
  };
  saveDraft = (id: string, write: DraftWrite) => hrisApiHubClient.saveDraft(id, write);
  updatePageProps = (id: string, write: PagePropsWrite) => hrisApiHubClient.updatePageProps(id, write);
  publishPage = (id: string, request: PublishRequest) => hrisApiHubClient.publishPage(id, request);
  previewPage = async (id: string) => {
    const dto = await hrisApiHubClient.previewPage(id);
    return { ...dto, owner: person(dto.owner) };
  };
  movePage = (id: string, request: MoveRequest) => hrisApiHubClient.movePage(id, request);
  reorderPages = (request: ReorderRequest) => hrisApiHubClient.reorderPages(request);
  duplicatePage = (id: string) => hrisApiHubClient.duplicatePage(id);
  unpublishPage = (id: string) => hrisApiHubClient.unpublishPage(id);
  deletePage = (id: string) => hrisApiHubClient.deletePage(id);

  // ── managing: who agreed ──
  whoAgreed = async (id: string, tab: AgreementTab) => {
    const dto = await hrisApiHubClient.whoAgreed(id, tab);
    return { ...dto, rows: dto.rows.map((r) => ({ ...r, avatarUrl: resolveBackendAssetUrl(r.avatarUrl) })) };
  };
  exportAgreements = (id: string, tab: AgreementTab) => hrisApiHubClient.exportAgreements(id, tab);
  remind = (id: string, userIds: string[]) => hrisApiHubClient.remind(id, userIds);

  // ── files, audience, settings ──
  uploadFile = (file: File) => hrisApiHubClient.uploadFile(file);
  resolveAudience = async (request: AudienceResolveRequest) => {
    const dto = await hrisApiHubClient.resolveAudience(request);
    return { ...dto, people: dto.people.map((p) => person(p) as PersonRef) };
  };
  settings = async () => {
    const dto = await hrisApiHubClient.settings();
    return { ...dto, editors: { ...dto.editors, people: dto.editors.people.map((p) => person(p) as PersonRef) } };
  };
  updateSettings = async (write: HubSettingsWrite) => {
    await hrisApiHubClient.updateSettings(write);
    return this.settings();
  };
}

export const hrisApiHubService = new HrisApiHubService();
