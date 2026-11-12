"use server";

// Every export is an explicit `async function`: Next refuses anything else in a "use server" file.

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiHubService } from "@/api/modules/hub/services";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";
import type {
  AgreeResult,
  Created,
  DraftSaved,
  DraftWrite,
  FileUploaded,
  HubSettings,
  HubSettingsWrite,
  MoveRequest,
  PagePropsWrite,
  PostWrite,
  Published,
  PublishRequest,
  Reminded,
  ReorderRequest,
  SavedType,
  SectionDeleteRequest,
  SectionWrite,
} from "@/models/hub";

async function run<T>(context: string, body: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await body() };
  } catch (error) {
    return toActionError(error, context);
  }
}

// ── the reader ──
export async function agreeToPageAction(input: { pageId: string; revisionId: string }): Promise<ActionResult<AgreeResult>> {
  return run("agreeToPageAction", () => hrisApiHubService.agree(input.pageId, input.revisionId));
}
export async function saveHubItemAction(input: { type: SavedType; id: string }): Promise<ActionResult<void>> {
  return run("saveHubItemAction", () => hrisApiHubService.save(input.type, input.id));
}
export async function unsaveHubItemAction(input: { type: SavedType; id: string }): Promise<ActionResult<void>> {
  return run("unsaveHubItemAction", () => hrisApiHubService.unsave(input.type, input.id));
}

// ── posts ──
export async function saveHubPostAction(input: {
  id: string | null;
  write: PostWrite;
  then: "DRAFT" | "PUBLISH" | "SCHEDULE";
  publishAt: string | null;
}): Promise<ActionResult<Created>> {
  return run("saveHubPostAction", () => hrisApiHubService.savePost(input));
}
export async function publishHubPostAction(id: string): Promise<ActionResult<void>> {
  return run("publishHubPostAction", () => hrisApiHubService.publishPost(id));
}
export async function scheduleHubPostAction(input: { id: string; publishAt: string }): Promise<ActionResult<void>> {
  return run("scheduleHubPostAction", () => hrisApiHubService.schedulePost(input.id, input.publishAt));
}
export async function cancelHubPostScheduleAction(id: string): Promise<ActionResult<void>> {
  return run("cancelHubPostScheduleAction", () => hrisApiHubService.cancelSchedule(id));
}
export async function unpublishHubPostAction(id: string): Promise<ActionResult<void>> {
  return run("unpublishHubPostAction", () => hrisApiHubService.unpublishPost(id));
}
export async function pinHubPostAction(id: string): Promise<ActionResult<void>> {
  return run("pinHubPostAction", () => hrisApiHubService.pinPost(id));
}
export async function unpinHubPostAction(id: string): Promise<ActionResult<void>> {
  return run("unpinHubPostAction", () => hrisApiHubService.unpinPost(id));
}
export async function duplicateHubPostAction(id: string): Promise<ActionResult<Created>> {
  return run("duplicateHubPostAction", () => hrisApiHubService.duplicatePost(id));
}
export async function deleteHubPostAction(id: string): Promise<ActionResult<void>> {
  return run("deleteHubPostAction", () => hrisApiHubService.deletePost(id));
}

// ── sections ──
export async function createHubSectionAction(write: SectionWrite): Promise<ActionResult<Created>> {
  return run("createHubSectionAction", () => hrisApiHubService.createSection(write));
}
export async function updateHubSectionAction(input: { id: string; write: SectionWrite }): Promise<ActionResult<void>> {
  return run("updateHubSectionAction", () => hrisApiHubService.updateSection(input.id, input.write));
}
export async function reorderHubSectionsAction(request: ReorderRequest): Promise<ActionResult<void>> {
  return run("reorderHubSectionsAction", () => hrisApiHubService.reorderSections(request));
}
export async function deleteHubSectionAction(input: { id: string; request: SectionDeleteRequest }): Promise<ActionResult<void>> {
  return run("deleteHubSectionAction", () => hrisApiHubService.deleteSection(input.id, input.request));
}

// ── pages ──
export async function createHubPageAction(sectionId: string | null): Promise<ActionResult<Created>> {
  return run("createHubPageAction", () => hrisApiHubService.createPage({ sectionId }));
}
export async function saveHubPageDraftAction(input: { id: string; write: DraftWrite }): Promise<ActionResult<DraftSaved>> {
  return run("saveHubPageDraftAction", () => hrisApiHubService.saveDraft(input.id, input.write));
}
export async function updateHubPagePropsAction(input: { id: string; write: PagePropsWrite }): Promise<ActionResult<void>> {
  return run("updateHubPagePropsAction", () => hrisApiHubService.updatePageProps(input.id, input.write));
}
export async function publishHubPageAction(input: { id: string; request: PublishRequest }): Promise<ActionResult<Published>> {
  return run("publishHubPageAction", () => hrisApiHubService.publishPage(input.id, input.request));
}
export async function moveHubPageAction(input: { id: string; request: MoveRequest }): Promise<ActionResult<void>> {
  return run("moveHubPageAction", () => hrisApiHubService.movePage(input.id, input.request));
}
export async function reorderHubPagesAction(request: ReorderRequest): Promise<ActionResult<void>> {
  return run("reorderHubPagesAction", () => hrisApiHubService.reorderPages(request));
}
export async function duplicateHubPageAction(id: string): Promise<ActionResult<Created>> {
  return run("duplicateHubPageAction", () => hrisApiHubService.duplicatePage(id));
}
export async function unpublishHubPageAction(id: string): Promise<ActionResult<void>> {
  return run("unpublishHubPageAction", () => hrisApiHubService.unpublishPage(id));
}
export async function deleteHubPageAction(id: string): Promise<ActionResult<void>> {
  return run("deleteHubPageAction", () => hrisApiHubService.deletePage(id));
}
export async function remindHubPageAction(input: { id: string; userIds: string[] }): Promise<ActionResult<Reminded>> {
  return run("remindHubPageAction", () => hrisApiHubService.remind(input.id, input.userIds));
}

// ── files and settings ──
/** An image for a cover or a page (≤ 10 MB, png/jpeg/gif/webp — Java refuses the rest). Multipart, so FormData. */
export async function uploadHubFileAction(form: FormData): Promise<ActionResult<FileUploaded>> {
  return run("uploadHubFileAction", async () => {
    const file = form.get("file");
    if (!(file instanceof File)) throw new Error("No file was attached.");
    return hrisApiHubService.uploadFile(file);
  });
}
export async function updateHubSettingsAction(write: HubSettingsWrite): Promise<ActionResult<HubSettings>> {
  return run("updateHubSettingsAction", () => hrisApiHubService.updateSettings(write));
}
